import { tipc } from '@egoist/tipc/main';

import {
  checkForUpdatesManually,
  getUpdateState,
  quitAndInstallUpdate,
  setupAutoUpdater,
} from './auto-update';
import type { UpdaterState } from './types';

const t = tipc.create();

const ipc = {
  getUpdateState: t.procedure.action(async () => {
    return Promise.resolve(getUpdateState());
  }),
  checkForUpdates: t.procedure.action(async () => {
    return checkForUpdatesManually();
  }),
  restartToUpdate: t.procedure.action(async () => {
    return Promise.resolve({ success: quitAndInstallUpdate() });
  }),
};

export const autoUpdate = {
  ipc,
  setup: setupAutoUpdater,
  getState: getUpdateState,
  checkForUpdates: checkForUpdatesManually,
  quitAndInstall: quitAndInstallUpdate,
} as const;

export type AutoUpdateRendererHandlers = {
  updateStateChanged: (state: UpdaterState) => void;
};

export type { UpdaterDisabledReason, UpdaterState, UpdaterStatus } from './types';
