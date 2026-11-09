import { BrowserWindow, NativeImage, nativeImage } from 'electron';

import { drawStatusDot } from './status-dot';

/** Overlay icons are 16x16 DIP; drawing at 2x keeps the dot crisp on HiDPI taskbars. */
const SCALE_FACTOR = 2;
const SIZE = 8 * SCALE_FACTOR;

const RUNNING_DESCRIPTION = 'Clicker is running';

let runningOverlay: NativeImage | null = null;
let isRunning = false;

const getRunningOverlay = (): NativeImage => {
  runningOverlay ??= nativeImage.createFromBitmap(
    drawStatusDot({
      size: SIZE,
      fill: { r: 34, g: 197, b: 94 },
      border: { r: 255, g: 255, b: 255 },
      borderWidth: 2,
    }),
    { width: SIZE, height: SIZE, scaleFactor: SCALE_FACTOR },
  );

  return runningOverlay;
};

/** Taskbar overlay icons are a Windows-only feature. */
const isSupported = (): boolean => process.platform === 'win32';

/** Paints the current run state onto the window's taskbar button. */
const apply = (window: BrowserWindow): void => {
  if (!isSupported()) return;

  if (isRunning) {
    window.setOverlayIcon(getRunningOverlay(), RUNNING_DESCRIPTION);
  } else {
    window.setOverlayIcon(null, '');
  }
};

/** Remembers the run state so windows created later show it too, and paints it now if a window exists. */
const setRunning = (running: boolean, window: BrowserWindow | null): void => {
  isRunning = running;

  if (window) {
    apply(window);
  }
};

export const taskbarStatus = { apply, setRunning } as const;
