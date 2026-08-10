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
};

export type IPCRouter = typeof router;
