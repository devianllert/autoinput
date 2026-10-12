import { app } from 'electron';

/**
 * Claims the single-instance lock for this process.
 *
 * Returns `false` when another instance already holds it — the caller must quit.
 * Otherwise `onSecondInstance` runs every time the user launches the app again.
 */
export const acquireSingleInstanceLock = (onSecondInstance: () => void): boolean => {
  if (!app.requestSingleInstanceLock()) {
    return false;
  }

  app.on('second-instance', onSecondInstance);

  return true;
};
