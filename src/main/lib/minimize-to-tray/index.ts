import { tipc } from '@egoist/tipc/main';
import { app, type BrowserWindow } from 'electron';

import type { MinimizeToTrayState } from '@/shared/settings/types';

import { getMinimizeToTrayEnabled, setMinimizeToTrayEnabled } from './store';

const t = tipc.create();
let hasRegisteredLifecycle = false;
let isApplicationQuitting = false;

const getState = (): MinimizeToTrayState => ({ enabled: getMinimizeToTrayEnabled() });

const update = (enabled: boolean): MinimizeToTrayState => {
  setMinimizeToTrayEnabled(enabled);
  return getState();
};

const bindWindow = (window: BrowserWindow): void => {
  window.on('close', (event) => {
    if (isApplicationQuitting || !getMinimizeToTrayEnabled()) return;

    event.preventDefault();
    window.hide();
  });
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
  setup: (): void => {
    if (!hasRegisteredLifecycle) {
      hasRegisteredLifecycle = true;
      app.on('before-quit', () => {
        isApplicationQuitting = true;
      });
      app.on('browser-window-created', (_, window) => bindWindow(window));
    }
  },
} as const;

export type { MinimizeToTrayState };
