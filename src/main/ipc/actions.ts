import { testRouter } from './actions/test';
import { windowRouter } from './actions/window';

export const router = {
  ...testRouter,
  ...windowRouter,
};

export type IPCRouter = typeof router;
