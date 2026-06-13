import { BrowserWindow } from 'electron';

import { createWindow } from '../lib/window';

let mainWindow: BrowserWindow | null = null;

export const createMainWindow = (): BrowserWindow => {
  mainWindow = createWindow({
    path: '/',
    title: 'autoclicker',
    width: 560,
    height: 570,
    minWidth: 360,
    frame: false,
    fullscreenable: false,
    resizable: true,
    showAfterReady: true,
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
};

export const getMainWindow = (): BrowserWindow => {
  if (!mainWindow) {
    return createMainWindow();
  }

  return mainWindow;
};
