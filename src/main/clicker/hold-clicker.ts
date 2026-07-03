import { performInputDown, performInputUp } from '../lib/automation/input';
import type { Clicker } from './types';

export class HoldClicker implements Clicker {
  public running = false;
  private keys: number[] | null = null;

  start(_intervalMs: number, keys: number[]): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.keys = keys;
    performInputDown(keys);
  }

  stop(): void {
    if (!this.running || !this.keys) {
      return;
    }

    performInputUp(this.keys);
    this.running = false;
    this.keys = null;
  }
}
