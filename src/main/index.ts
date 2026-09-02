import { registerIpcMain } from '@egoist/tipc/main';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { app } from 'electron';

import { registerHotkeys } from './hotkeys/hotkeys';
import { router } from './ipc/router';
import { accessibilityPermission } from './lib/accessibility/accessibility-permission';
import { autoUpdate } from './lib/auto-update';
import { minimizeToTray } from './lib/minimize-to-tray';
import { createMainWindow, showMainWindow } from './windows/main';

console.debug('userData:', app.getPath('userData'));

const bootstrap = async () => {
  await app.whenReady();

  // Set app user model id for windows
  electronApp.setAppUserModelId('devianllert.autoinput');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', function () {
    showMainWindow();
  });

  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  registerIpcMain(router);
  await minimizeToTray.setup(showMainWindow);
  const mainWindow = createMainWindow();
  autoUpdate.setup(mainWindow);

  const accessibilityPermissionState = accessibilityPermission.check();

  if (accessibilityPermissionState.granted) {
    const hotkeys = registerHotkeys();
    hotkeys.run();
  }
};

void bootstrap();
