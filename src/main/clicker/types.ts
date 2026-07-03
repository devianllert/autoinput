export type { ClickerConfig, ClickerInputMode } from '@/shared/clicker/types';

export type ClickerTimingConfig = {
  cps: number;
};

export type Clicker = {
  running: boolean;
  start(intervalMs: number, keys: number[]): void;
  stop(): void;
};
