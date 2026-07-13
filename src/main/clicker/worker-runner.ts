import { getHandlers } from '../ipc/listeners';
import { enhancedWorker } from '../lib/enhanced-worker';
import { PowerSaveBlocker } from '../lib/power-save-blocker';
import { disableHighResolutionTimer, enableHighResolutionTimer } from '../lib/timer-resolution';
import { getMainWindow } from '../windows/main';
import { getClickerConfig } from './store';
import { WindowTargetGuard } from './window-target-guard';
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
  private readonly powerSaveBlocker = new PowerSaveBlocker();
  private readonly windowTargetGuard = new WindowTargetGuard();

  public start(cps: number): void {
    if (this.worker || !Number.isFinite(cps) || cps <= 0) {
      return;
    }

    if (!this.windowTargetGuard.canRunInActiveWindow()) {
      return;
    }

    this.isRunning = true;
    notifyRenderer(true);
    this.powerSaveBlocker.start();
    this.windowTargetGuard.start({
      onTargetMismatch: () => {
        this.stop();
      },
    });

    if (enableHighResolutionTimer()) {
      console.log('[clicker] Windows timer resolution set to 1ms');
    }

    this.worker = enhancedWorker(clickerWorker, {
      data: {
        intervalMs: 1000 / cps,
        config: getClickerConfig(),
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
        this.windowTargetGuard.stop();
        disableHighResolutionTimer();
        this.powerSaveBlocker.stop();
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

    this.windowTargetGuard.stop();
    this.isRunning = false;
    notifyRenderer(false);
    this.worker.postMessage('stop');
  }

  public applyWindowTargetConfig(): void {
    if (!this.isRunning) {
      this.windowTargetGuard.stop();
      return;
    }

    this.windowTargetGuard.sync();
  }
}

export const autoClicker = new ClickerRunner();
