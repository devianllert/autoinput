import { app } from 'electron';

import { getMainWindow } from '../../windows/main';

export const disallowMultipleAppInstance = (): void => {
  const isSingleInstance = app.requestSingleInstanceLock();
  if (!isSingleInstance) {
    app.quit();
  }

  app.on('second-instance', () => {
    const mainWindow = getMainWindow();
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
    }
  });
};
