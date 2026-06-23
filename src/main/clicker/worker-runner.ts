import { getHandlers } from '../ipc/listeners';
import { enhancedWorker } from '../lib/enhanced-worker';
import { getMainWindow } from '../windows/main';
import { disableHighResolutionTimer, enableHighResolutionTimer } from './timer-resolution';
import clickerWorker from './worker?nodeWorker';

const notifyRenderer = (isRunning: boolean): void => {
  const window = getMainWindow();

  if (window.isDestroyed()) {
    return;
  }

  getHandlers(window.webContents).clickerStateChanged.send(isRunning);
};

export class ClickerRunner {
  public isRunning = false;

  private worker: ReturnType<typeof enhancedWorker> | null = null;

  public start(cps: number): void {
    if (this.worker) {
      return;
    }

    this.isRunning = true;
    notifyRenderer(true);

    if (enableHighResolutionTimer()) {
      console.log('[clicker] Windows timer resolution set to 1ms');
    }

    this.worker = enhancedWorker(clickerWorker, {
      data: {
        intervalMs: 1000 / cps,
      },
      onMessage: (message: unknown) => {
        if (message === 'stopped') {
          this.worker?.terminate();
          this.worker = null;
        }
      },
      onError: (error) => {
        console.error(`[clicker-worker] ${error.message}`);
      },
      onFinish: () => {
        disableHighResolutionTimer();
        this.isRunning = false;
        this.worker = null;
        notifyRenderer(false);
      },
    });
  }

  public stop(): void {
    if (!this.worker) {
      return;
    }

    this.isRunning = false;
    notifyRenderer(false);
    this.worker.postMessage('stop');
  }
}

export const autoClicker = new ClickerRunner();
