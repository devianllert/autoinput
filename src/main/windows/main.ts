import { BrowserWindow } from 'electron';

import { createWindow } from '../lib/window';

let mainWindow: BrowserWindow | null = null;

export const createMainWindow = (): BrowserWindow => {
  const isMacOS = process.platform === 'darwin';

  mainWindow = createWindow({
    path: '/',
    title: 'AutoInput',
    width: 560,
    height: 570,
    minWidth: 360,
    frame: isMacOS,
    titleBarStyle: isMacOS ? 'hidden' : 'default',
    titleBarOverlay: false,
    ...(isMacOS && { trafficLightPosition: { x: 12, y: 12 } }),
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
