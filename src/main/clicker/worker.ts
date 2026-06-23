import { parentPort, workerData } from 'node:worker_threads';

import { clicker } from './clicker';

const WORKER_TAG = '[clicker-worker]';

type WorkerData = {
  intervalMs: number;
};

const port = parentPort;
const { intervalMs } = workerData as WorkerData;

if (!port) {
  throw new Error('IllegalState');
}

port.on('message', (message: unknown) => {
  if (message !== 'stop') {
    return;
  }

  clicker.stop();
  port.postMessage('stopped');
});

clicker.start(intervalMs);
console.log(`${WORKER_TAG} started (${(1000 / intervalMs).toFixed(0)} CPS target)`);
