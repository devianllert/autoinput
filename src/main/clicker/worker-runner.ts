import type { WindowTargetConfig } from '@/shared/window-target/types';

import { getHandlers } from '../ipc/listeners';
import { enhancedWorker } from '../lib/enhanced-worker';
import { PowerSaveBlocker } from '../lib/power-save-blocker';
import { disableHighResolutionTimer, enableHighResolutionTimer } from '../lib/timer-resolution';
import { findMainWindow } from '../windows/main';
import { getClickerConfig, getWindowTargetConfig } from './store';
import { WindowTargetGuard } from './window-target-guard';
import type { ClickerWorkerMessage } from './worker-protocol';
import clickerWorker from './worker?nodeWorker';

type ClickerWorker = ReturnType<typeof enhancedWorker>;

const notifyRenderer = (isRunning: boolean): void => {
  const window = findMainWindow();

  if (!window) {
    return;
  }

  getHandlers(window.webContents).clickerStateChanged.send(isRunning);
};

/**
 * Drives a single long-lived clicker worker via ordered start/stop messages.
 * The worker is never terminated mid-click, so held input is always released by the worker itself.
 */
export class ClickerRunner {
  public isRunning = false;

  private worker: ClickerWorker | null = null;
  private isShuttingDown = false;
  private readonly powerSaveBlocker = new PowerSaveBlocker();
  private readonly windowTargetGuard = new WindowTargetGuard();

  public get hasWorker(): boolean {
    return this.worker !== null;
  }

  public start(cps: number): void {
    if (this.isRunning || this.isShuttingDown || !Number.isFinite(cps) || cps <= 0) {
      return;
    }

    this.windowTargetGuard.setTarget(getWindowTargetConfig());

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

    this.worker ??= enhancedWorker(clickerWorker, {
      onError: (error) => {
        console.error(`[clicker-worker] ${error.message}`);
      },
      onFinish: () => {
        // Exited on shutdown or crashed; after a crash the next start creates a new worker.
        this.worker = null;
        this.stop();
      },
    });

    this.worker.postMessage({
      type: 'start',
      intervalMs: 1000 / cps,
      config: getClickerConfig(),
    } satisfies ClickerWorkerMessage);
  }

  /** The single place that ends a run: resets state, frees resources, tells the worker to stop. */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.windowTargetGuard.stop();
    disableHighResolutionTimer();
    this.powerSaveBlocker.stop();
    notifyRenderer(false);
    // The worker is already gone when this runs because it crashed.
    this.worker?.postMessage({ type: 'stop' } satisfies ClickerWorkerMessage);
  }

  /** Stops the clicker and resolves once the worker has released held input and exited. */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    this.stop();

    if (!this.worker) {
      return;
    }

    this.worker.postMessage({ type: 'shutdown' } satisfies ClickerWorkerMessage);
    await this.worker.exited;
  }

  public applyWindowTargetConfig(config: WindowTargetConfig = getWindowTargetConfig()): void {
    this.windowTargetGuard.setTarget(config);

    if (!this.isRunning) {
      this.windowTargetGuard.stop();
      return;
    }

    this.windowTargetGuard.sync();
  }
}

export const autoClicker = new ClickerRunner();
