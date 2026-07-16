import { join } from 'node:path';
import { is } from '@electron-toolkit/utils';
import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron';

import icon from '../../../../resources/icon.svg?asset';

interface CreateWindowOptions extends BrowserWindowConstructorOptions {
  showAfterReady?: boolean;
  path: string;
  query?: Record<string, string>;
}

export function removeURLExtraDoubleSlashes(url: string) {
  return url.replace(/([^:]\/)\/+/g, '$1');
}

export const createWindow = (options: CreateWindowOptions): BrowserWindow => {
  const { showAfterReady, path, query, ...windowOptions } = options;

  const window = new BrowserWindow({
    title: 'AutoInput',
    width: 900,
    height: 670,
    show: false,
    frame: true,
    fullscreen: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    titleBarOverlay: true,
    trafficLightPosition: { x: 6, y: 2 },
    icon,
    ...windowOptions,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: join(__dirname, '../preload/index.js'),
      ...windowOptions.webPreferences,
    },
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void window.loadURL(
      process.env['ELECTRON_RENDERER_URL'] +
        removeURLExtraDoubleSlashes(`#${path}`) +
        (query ? `?${new URLSearchParams(query).toString()}` : ''),
    );
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: removeURLExtraDoubleSlashes(path),
      query,
    });
  }

  if (showAfterReady) {
    window.on('ready-to-show', () => {
      window.show();
    });
  }

  window.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return window;
};
