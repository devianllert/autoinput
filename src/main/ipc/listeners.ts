import { getRendererHandlers } from '@egoist/tipc/main';
import { WebContents } from 'electron';

export type RendererHandlers = {
  log: (message: string) => void;
  clickerStateChanged: (running: boolean) => void;
};

export const getHandlers = (webContents: WebContents) => {
  return getRendererHandlers<RendererHandlers>(webContents);
};
