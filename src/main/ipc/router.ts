import { autoUpdate } from '../lib/auto-update';
import { minimizeToTray } from '../lib/minimize-to-tray';
import { clickerRouter } from './actions/clicker';
import { permissionsRouter } from './actions/permissions';
import { settingsRouter } from './actions/settings';
import { shortcutsRouter } from './actions/shortcuts';
import { testRouter } from './actions/test';
import { windowRouter } from './actions/window';

export const router = {
  ...testRouter,
  ...windowRouter,
  ...shortcutsRouter,
  ...clickerRouter,
  ...permissionsRouter,
  ...settingsRouter,
  ...autoUpdate.ipc,
  ...minimizeToTray.ipc,
};

export type IPCRouter = typeof router;
