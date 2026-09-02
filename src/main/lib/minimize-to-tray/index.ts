import { resolve } from 'node:path';
import { tipc } from '@egoist/tipc/main';
import { app, Menu, Tray, type BrowserWindow } from 'electron';

import type { MinimizeToTrayState } from '@/shared/settings/types';

import { getMinimizeToTrayEnabled, setMinimizeToTrayEnabled } from './store';

const t = tipc.create();
let tray: Tray | null = null;
let hasRegisteredLifecycle = false;
let isApplicationQuitting = false;

const getState = (): MinimizeToTrayState => ({ enabled: getMinimizeToTrayEnabled() });

const update = (enabled: boolean): MinimizeToTrayState => {
  setMinimizeToTrayEnabled(enabled);
  return getState();
};

const getTrayIconTarget = (): string => {
  const executablePath = app.getPath('exe');
  return process.platform === 'darwin' ? resolve(executablePath, '../../..') : executablePath;
};

const bindWindow = (window: BrowserWindow): void => {
  window.on('close', (event) => {
    if (isApplicationQuitting || !getMinimizeToTrayEnabled()) return;

    event.preventDefault();
    window.hide();
  });
};

const createTray = async (showWindow: () => void): Promise<void> => {
  if (tray) return;

  const icon = await app.getFileIcon(getTrayIconTarget(), { size: 'small' });

  if (icon.isEmpty()) {
    throw new Error('Could not load the application icon for the system tray.');
  }

  tray = new Tray(icon);
  tray.setToolTip('AutoInput');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open AutoInput', click: showWindow },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          isApplicationQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on('click', showWindow);
};

const ipc = {
  getMinimizeToTrayState: t.procedure.action(async () => {
    return Promise.resolve(getState());
  }),
  updateMinimizeToTray: t.procedure.input<boolean>().action(async ({ input }) => {
    return Promise.resolve(update(input));
  }),
};

export const minimizeToTray = {
  ipc,
  getState,
  update,
  setup: async (showWindow: () => void): Promise<void> => {
    if (!hasRegisteredLifecycle) {
      hasRegisteredLifecycle = true;
      app.on('before-quit', () => {
        isApplicationQuitting = true;
      });
      app.on('browser-window-created', (_, window) => bindWindow(window));
    }

    await createTray(showWindow);
  },
} as const;

export type { MinimizeToTrayState };
