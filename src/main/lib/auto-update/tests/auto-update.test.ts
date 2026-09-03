import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    app: {
      isPackaged: true,
      getVersion: vi.fn(() => '1.0.0'),
    },
    autoUpdater: {
      autoDownload: false,
      autoInstallOnAppQuit: false,
      forceDevUpdateConfig: false,
      checkForUpdates: vi.fn(() => Promise.resolve(null)),
      quitAndInstall: vi.fn(),
      on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
        listeners.set(event, [...(listeners.get(event) ?? []), listener]);
      }),
      emit: (event: string, ...args: unknown[]) => {
        for (const listener of listeners.get(event) ?? []) listener(...args);
      },
      reset: () => {
        listeners.clear();
        mocks.autoUpdater.autoDownload = false;
        mocks.autoUpdater.autoInstallOnAppQuit = false;
        mocks.autoUpdater.forceDevUpdateConfig = false;
        mocks.autoUpdater.checkForUpdates.mockClear();
        mocks.autoUpdater.quitAndInstall.mockClear();
        mocks.autoUpdater.on.mockClear();
      },
    },
    dialog: {
      showMessageBox: vi.fn(() => Promise.resolve({ response: 1 })),
    },
  };
});

vi.mock('electron', () => ({
  app: mocks.app,
  BrowserWindow: {
    getAllWindows: () => [],
  },
  dialog: mocks.dialog,
}));

vi.mock('electron-updater', () => ({
  autoUpdater: mocks.autoUpdater,
}));

vi.mock('../../../ipc/listeners', () => ({
  getHandlers: () => ({
    updateStateChanged: {
      send: vi.fn(),
    },
  }),
}));

type AutoUpdateModule = typeof import('../auto-update');

let updater: AutoUpdateModule;
let mockedPlatform: NodeJS.Platform;

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  mocks.app.isPackaged = true;
  mocks.autoUpdater.reset();
  mocks.dialog.showMessageBox.mockClear();
  mocks.dialog.showMessageBox.mockResolvedValue({ response: 1 });
  vi.unstubAllEnvs();
  vi.stubEnv('PORTABLE_EXECUTABLE_FILE', '');
  mockedPlatform = 'win32';
  vi.spyOn(process, 'platform', 'get').mockImplementation(() => mockedPlatform);
  updater = await import('../auto-update');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('auto updater', () => {
  it('stays disabled during normal development', async () => {
    mocks.app.isPackaged = false;

    updater.setupAutoUpdater(null);

    expect(updater.getUpdateState()).toMatchObject({
      status: 'disabled',
      disabledReason: 'development',
    });
    expect(mocks.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    await expect(updater.checkForUpdatesManually()).resolves.toMatchObject({ status: 'disabled' });
  });

  it('does not start in a portable Windows build', () => {
    vi.stubEnv('PORTABLE_EXECUTABLE_FILE', 'C:\\Tools\\autoinput.exe');

    updater.setupAutoUpdater(null);

    expect(updater.getUpdateState()).toMatchObject({ status: 'disabled' });
    expect(mocks.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('stays disabled in a packaged macOS build even when the dev updater flag is set', () => {
    mockedPlatform = 'darwin';
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');

    updater.setupAutoUpdater(null);

    expect(updater.getUpdateState()).toMatchObject({
      status: 'disabled',
      disabledReason: 'unsupported-platform',
    });
    expect(mocks.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    expect(mocks.autoUpdater.on).not.toHaveBeenCalled();
  });

  it('checks at startup and tracks the download lifecycle', () => {
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);

    expect(mocks.autoUpdater.autoDownload).toBe(true);
    expect(mocks.autoUpdater.autoInstallOnAppQuit).toBe(true);
    expect(mocks.autoUpdater.checkForUpdates).toHaveBeenCalledOnce();

    mocks.autoUpdater.emit('checking-for-update');
    expect(updater.getUpdateState()).toMatchObject({ status: 'checking' });

    mocks.autoUpdater.emit('update-available', { version: '1.1.0' });
    expect(updater.getUpdateState()).toMatchObject({
      availableVersion: '1.1.0',
      status: 'downloading',
    });

    mocks.autoUpdater.emit('download-progress', {
      percent: 42.5,
      transferred: 425,
      total: 1000,
    });
    expect(updater.getUpdateState()).toMatchObject({
      status: 'downloading',
      downloadPercent: 42.5,
    });

    mocks.autoUpdater.emit('update-downloaded', { version: '1.1.0' });
    expect(updater.getUpdateState()).toMatchObject({
      status: 'ready',
      downloadPercent: 100,
    });
  });

  it('checks manually and installs only a downloaded update', async () => {
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);

    expect(updater.quitAndInstallUpdate()).toBe(false);
    await updater.checkForUpdatesManually();
    expect(mocks.autoUpdater.checkForUpdates).toHaveBeenCalledTimes(2);

    mocks.autoUpdater.emit('update-downloaded', { version: '1.1.0' });
    expect(updater.quitAndInstallUpdate()).toBe(true);
    expect(mocks.autoUpdater.quitAndInstall).toHaveBeenCalledOnce();
  });

  it('exposes a check failure without storing presentation text', () => {
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);

    mocks.autoUpdater.emit('error', new Error('network unavailable'));

    expect(updater.getUpdateState()).toMatchObject({
      status: 'error',
      availableVersion: null,
    });
  });

  it('keeps the available version when downloading an update fails', () => {
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);
    mocks.autoUpdater.emit('update-available', { version: '1.1.0' });

    mocks.autoUpdater.emit('error', new Error('socket closed'));

    expect(updater.getUpdateState()).toMatchObject({
      status: 'error',
      availableVersion: '1.1.0',
    });
  });

  it('handles a rejected startup check without an unhandled rejection', async () => {
    mocks.autoUpdater.checkForUpdates.mockRejectedValueOnce(new Error('release unavailable'));
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');

    updater.setupAutoUpdater(null);

    await vi.waitFor(() => {
      expect(updater.getUpdateState()).toMatchObject({
        status: 'error',
        availableVersion: null,
      });
    });
  });

  it('returns a user-friendly state when a manual check rejects', async () => {
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);
    mocks.autoUpdater.checkForUpdates.mockRejectedValueOnce(new Error('release unavailable'));

    await expect(updater.checkForUpdatesManually()).resolves.toMatchObject({
      status: 'error',
      availableVersion: null,
    });
  });

  it('installs from the downloaded-update dialog when confirmed', async () => {
    mocks.dialog.showMessageBox.mockResolvedValue({ response: 0 });
    vi.stubEnv('VITE_AUTOINPUT_ENABLE_DEV_UPDATER', '1');
    updater.setupAutoUpdater(null);

    mocks.autoUpdater.emit('update-downloaded', { version: '1.1.0' });
    await vi.waitFor(() => expect(mocks.autoUpdater.quitAndInstall).toHaveBeenCalledOnce());
  });
});
