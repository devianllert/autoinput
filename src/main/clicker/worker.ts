import { parentPort } from 'node:worker_threads';

import { createClicker } from './clicker';
import type { Clicker } from './types';
import type { ClickerWorkerMessage } from './worker-protocol';

const WORKER_TAG = '[clicker-worker]';

const port = parentPort;

if (!port) {
  throw new Error('IllegalState');
}

let clicker: Clicker | null = null;

const stopClicker = (): void => {
  clicker?.stop();
  clicker = null;
};

port.on('message', (message: ClickerWorkerMessage) => {
  switch (message.type) {
    case 'start': {
      if (clicker) {
        throw new Error(`${WORKER_TAG} start received while a clicker is already running`);
      }

      clicker = createClicker(message.config.mode);
      clicker.start(message.intervalMs, message.config.keys);
      console.log(`${WORKER_TAG} started (${(1000 / message.intervalMs).toFixed(0)} CPS target)`);
      return;
    }
    case 'stop':
      stopClicker();
      return;
    case 'shutdown':
      stopClicker();
      // Inside a worker thread this ends only the thread, not the app.
      process.exit(0);
  }
});
