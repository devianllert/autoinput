import { app, type BrowserWindow } from 'electron';

import type { MinimizeToTrayState } from '@/shared/settings/types';

import { getMinimizeToTrayEnabled, setMinimizeToTrayEnabled } from './store';

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

export const minimizeToTray = {
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
