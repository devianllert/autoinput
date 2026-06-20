import { clickerRouter } from './actions/clicker';
import { shortcutsRouter } from './actions/shortcuts';
import { testRouter } from './actions/test';
import { windowRouter } from './actions/window';

export const router = {
  ...testRouter,
  ...windowRouter,
  ...shortcutsRouter,
  ...clickerRouter,
};

export type IPCRouter = typeof router;
