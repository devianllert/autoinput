import { app } from 'electron';

import { showMainWindow } from '../../windows/main';

export const disallowMultipleAppInstance = (): void => {
  const isSingleInstance = app.requestSingleInstanceLock();
  if (!isSingleInstance) {
    app.quit();
  }

  app.on('second-instance', () => {
    showMainWindow();
  });
};
