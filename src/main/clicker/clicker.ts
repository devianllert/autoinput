import { mouseClick } from '@dvnllrt/enigo-napi-rs';

import { getBatchDelayMs, getBatchSize, getSleepUntilDeadlineMs } from './loop';

export class Clicker {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  public running = false;
  private intervalMs = 0;
  private batchSize = 1;
  private nextBatchDeadlineMs = 0;

  start(intervalMs: number) {
    if (this.running || intervalMs <= 0) {
      return;
    }

    const cps = 1000 / intervalMs;

    this.running = true;
    this.intervalMs = intervalMs;
    this.batchSize = getBatchSize(cps);
    this.nextBatchDeadlineMs = performance.now();

    this.runBatch();
  }

  startClicksPerSecond(clicksPerSecond: number) {
    this.start(1000 / clicksPerSecond);
  }

  stop() {
    this.running = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private clickBatch(count: number) {
    for (let i = 0; i < count; i++) {
      if (!this.running) {
        return;
      }

      mouseClick('left');
    }
  }

  private runBatch = (): void => {
    if (!this.running) {
      return;
    }

    const batchDelayMs = getBatchDelayMs(this.intervalMs, this.batchSize);
    this.nextBatchDeadlineMs += batchDelayMs;

    this.clickBatch(this.batchSize);

    if (!this.running) {
      return;
    }

    const delay = getSleepUntilDeadlineMs(this.nextBatchDeadlineMs, performance.now());
    this.timeoutId = setTimeout(this.runBatch, delay);
  };
}

export const clicker = new Clicker();
