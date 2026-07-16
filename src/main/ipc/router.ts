import { clickerRouter } from './actions/clicker';
import { settingsRouter } from './actions/settings';
import { shortcutsRouter } from './actions/shortcuts';
import { testRouter } from './actions/test';
import { windowRouter } from './actions/window';

export const router = {
  ...testRouter,
  ...windowRouter,
  ...shortcutsRouter,
  ...clickerRouter,
  ...settingsRouter,
};

export type IPCRouter = typeof router;
