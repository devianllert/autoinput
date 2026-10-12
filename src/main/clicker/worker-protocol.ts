import type { ClickerConfig } from './types';

/** Messages the main process sends to the long-lived clicker worker. Handled strictly in order. */
export type ClickerWorkerMessage =
  | { type: 'start'; intervalMs: number; config: ClickerConfig }
  | { type: 'stop' }
  /** Releases held input and exits the worker thread with code 0. */
  | { type: 'shutdown' };
