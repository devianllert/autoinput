import { app, BrowserWindow, dialog, type MessageBoxOptions } from 'electron';
import { autoUpdater } from 'electron-updater';

import { getHandlers } from '../../ipc/listeners';
import type { UpdaterDisabledReason, UpdaterState } from './types';

let hasUpdaterSetup = false;
let updaterMainWindow: BrowserWindow | null = null;
let updaterEnabled = false;

let updaterState: UpdaterState = {
  currentVersion: app.getVersion(),
  availableVersion: null,
  status: 'idle',
  downloadPercent: 0,
  disabledReason: null,
};

const isDevUpdaterEnabled = (): boolean => {
  const value = import.meta.env.VITE_AUTOINPUT_ENABLE_DEV_UPDATER;

  return value === '1' || value === 'true';
};

const getDisabledReason = (devUpdaterEnabled: boolean): UpdaterDisabledReason | null => {
  if (devUpdaterEnabled) return null;
  if (!app.isPackaged) return 'development';
  if (process.env['PORTABLE_EXECUTABLE_FILE']) {
    return 'portable';
  }

  return null;
};

const emitUpdateState = (): void => {
  const state = getUpdateState();

  for (const window of BrowserWindow.getAllWindows()) {
    getHandlers(window.webContents).updateStateChanged.send(state);
  }
};

const setUpdaterState = (patch: Partial<UpdaterState>): void => {
  updaterState = {
    ...updaterState,
    ...patch,
  };

  emitUpdateState();
};

const handleUpdaterError = (error: unknown): void => {
  setUpdaterState({
    status: 'error',
  });
  console.error('[updater] Update operation failed.', error);
};

const runUpdateCheck = async (): Promise<UpdaterState> => {
  setUpdaterState({
    availableVersion: null,
    status: 'checking',
    downloadPercent: 0,
  });

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    if (updaterState.status !== 'error') {
      handleUpdaterError(error);
    }
  }

  return getUpdateState();
};

const showUpdateDownloadedDialog = async (mainWindow: BrowserWindow | null): Promise<void> => {
  const messageBoxOptions: MessageBoxOptions = {
    type: 'info',
    title: 'Update ready',
    message: 'A new version of AutoInput has been downloaded.',
    detail: 'Install the update now? AutoInput will restart.',
    buttons: ['Install now', 'Later'],
    defaultId: 0,
    cancelId: 1,
  };

  const result = mainWindow
    ? await dialog.showMessageBox(mainWindow, messageBoxOptions)
    : await dialog.showMessageBox(messageBoxOptions);

  if (result.response === 0) {
    quitAndInstallUpdate();
  }
};

export const getUpdateState = (): UpdaterState => {
  return {
    ...updaterState,
    currentVersion: app.getVersion(),
  };
};

const setDisabledState = (reason: UpdaterDisabledReason): void => {
  updaterEnabled = false;
  setUpdaterState({
    availableVersion: null,
    status: 'disabled',
    downloadPercent: 0,
    disabledReason: reason,
  });
};

export const checkForUpdatesManually = async (): Promise<UpdaterState> => {
  if (!updaterEnabled) {
    return getUpdateState();
  }

  return runUpdateCheck();
};

export const quitAndInstallUpdate = (): boolean => {
  if (updaterState.status !== 'ready') {
    return false;
  }

  autoUpdater.quitAndInstall();
  return true;
};

export const setupAutoUpdater = (mainWindow: BrowserWindow | null): void => {
  updaterMainWindow = mainWindow;

  if (hasUpdaterSetup) {
    return;
  }

  hasUpdaterSetup = true;
  const devUpdaterEnabled = isDevUpdaterEnabled();
  const disabledReason = getDisabledReason(devUpdaterEnabled);

  if (disabledReason) {
    console.info(`[updater] ${disabledReason}`);
    setDisabledState(disabledReason);
    return;
  }

  if (devUpdaterEnabled) {
    autoUpdater.forceDevUpdateConfig = true;
  }

  updaterEnabled = true;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdaterState({
      availableVersion: null,
      status: 'checking',
      downloadPercent: 0,
    });
    console.info('[updater] Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    setUpdaterState({
      availableVersion: info.version,
      status: 'downloading',
      downloadPercent: 0,
    });
    console.info(`[updater] Update available: v${info.version}`);
  });

  autoUpdater.on('update-not-available', (info) => {
    setUpdaterState({
      availableVersion: null,
      status: 'up-to-date',
      downloadPercent: 0,
    });
    console.info(`[updater] No updates found. Current latest: v${info.version}`);
  });

  autoUpdater.on('download-progress', (progress) => {
    setUpdaterState({
      status: 'downloading',
      downloadPercent: progress.percent,
    });
    console.info(
      `[updater] Downloading update: ${progress.percent.toFixed(1)}% (${progress.transferred}/${progress.total})`,
    );
  });

  autoUpdater.on('update-downloaded', (info) => {
    setUpdaterState({
      availableVersion: info.version,
      status: 'ready',
      downloadPercent: 100,
    });
    void showUpdateDownloadedDialog(updaterMainWindow);
  });

  autoUpdater.on('error', handleUpdaterError);

  void runUpdateCheck();
};
