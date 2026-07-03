import { parentPort, workerData } from 'node:worker_threads';

import type { ClickerConfig } from '@/shared/clicker/types';

import { createClicker } from './clicker';
import type { Clicker } from './types';

const WORKER_TAG = '[clicker-worker]';

type WorkerData = {
  intervalMs: number;
  config: ClickerConfig;
};

const port = parentPort;
const { intervalMs, config } = workerData as WorkerData;

if (!port) {
  throw new Error('IllegalState');
}

let clicker: Clicker | null = createClicker(config.mode);

clicker.start(intervalMs, config.keys);
console.log(`${WORKER_TAG} started (${(1000 / intervalMs).toFixed(0)} CPS target)`);

port.on('message', (message: unknown) => {
  if (message !== 'stop') {
    return;
  }

  clicker?.stop();
  clicker = null;
  port.postMessage('stopped');
});
