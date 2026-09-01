import { getRendererHandlers } from '@egoist/tipc/main';
import { WebContents } from 'electron';

import type { AutoUpdateRendererHandlers } from '../lib/auto-update';

export type RendererHandlers = AutoUpdateRendererHandlers & {
  log: (message: string) => void;
  clickerStateChanged: (running: boolean) => void;
};

export const getHandlers = (webContents: WebContents) => {
  return getRendererHandlers<RendererHandlers>(webContents);
};
