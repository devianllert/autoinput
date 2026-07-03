import { performInputTap } from '../lib/automation/input';
import { getBatchDelayMs, getBatchSize, getSleepUntilDeadlineMs } from './loop';
import type { Clicker } from './types';

export class PressClicker implements Clicker {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private immediateId: ReturnType<typeof setImmediate> | null = null;
  public running = false;
  private intervalMs = 0;
  private batchSize = 1;
  private nextBatchDeadlineMs = 0;
  private keys: number[] | null = null;

  start(intervalMs: number, keys: number[]): void {
    if (this.running || intervalMs <= 0) {
      return;
    }

    const cps = 1000 / intervalMs;

    this.running = true;
    this.intervalMs = intervalMs;
    this.keys = keys;
    this.batchSize = getBatchSize(cps);
    this.nextBatchDeadlineMs = performance.now();

    this.runBatch();
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.immediateId) {
      clearImmediate(this.immediateId);
      this.immediateId = null;
    }

    this.keys = null;
  }

  private clickBatch(count: number): void {
    if (!this.keys) {
      return;
    }

    for (let i = 0; i < count; i++) {
      if (!this.running || !this.keys) {
        return;
      }

      performInputTap(this.keys);
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

    if (delay === 0) {
      // setTimeout(0) still waits ms on Windows; setImmediate keeps up when input-bound.
      this.immediateId = setImmediate(this.runBatch);
      return;
    }

    this.timeoutId = setTimeout(this.runBatch, delay);
  };
}
