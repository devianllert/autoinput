import { registerIpcMain } from '@egoist/tipc/main';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { app } from 'electron';

import { autoClicker } from './clicker/worker-runner';
import { registerHotkeys } from './hotkeys/hotkeys';
import { router } from './ipc/router';
import { accessibilityPermission } from './lib/accessibility/accessibility-permission';
import { autoUpdate } from './lib/auto-update';
import { minimizeToTray } from './lib/minimize-to-tray';
import { appTray } from './lib/tray';
import { acquireSingleInstanceLock } from './lib/window/single-instance';
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

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Let the worker release held keys/buttons before the process exits.
  app.on('before-quit', (event) => {
    if (!autoClicker.hasWorker) return;

    event.preventDefault();
    void autoClicker.shutdown().then(() => app.quit());
  });

  registerIpcMain(router);
  appTray.setup(showMainWindow);
  minimizeToTray.setup();
  createMainWindow();
  autoUpdate.setup();

  const accessibilityPermissionState = accessibilityPermission.check();

  if (accessibilityPermissionState.granted) {
    const hotkeys = registerHotkeys();
    hotkeys.run();
  }
};

// A second copy would install its own global hook and click on the same hotkey.
if (acquireSingleInstanceLock(showMainWindow)) {
  void bootstrap();
} else {
  app.quit();
}
