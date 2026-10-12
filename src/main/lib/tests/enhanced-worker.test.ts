import { EventEmitter } from 'node:events';
import type { Worker } from 'node:worker_threads';
import { describe, expect, it, vi } from 'vitest';

import { enhancedWorker } from '../enhanced-worker';

class FakeWorker extends EventEmitter {
  threadId = 1;
  postMessage = vi.fn();
  terminate = vi.fn(() => {
    this.emit('exit', 1);
    return Promise.resolve(1);
  });
}

const setup = () => {
  const fake = new FakeWorker();
  const callbacks = {
    onError: vi.fn(),
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
    onFinish: vi.fn(),
  };
  const worker = enhancedWorker(() => fake as unknown as Worker, callbacks);

  return { fake, callbacks, worker };
};

describe('enhancedWorker', () => {
  it('reports a clean exit as success', async () => {
    const { fake, callbacks, worker } = setup();

    fake.emit('exit', 0);
    await worker.exited;

    expect(callbacks.onSuccess).toHaveBeenCalledOnce();
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onFinish).toHaveBeenCalledWith(0);
  });

  it('reports an unexpected non-zero exit as an error', () => {
    const { fake, callbacks } = setup();

    fake.emit('exit', 1);

    expect(callbacks.onError).toHaveBeenCalledOnce();
    expect(callbacks.onCancel).not.toHaveBeenCalled();
    expect(callbacks.onFinish).toHaveBeenCalledWith(1);
  });

  it('reports terminate() as a cancel, not an error', () => {
    const { callbacks, worker } = setup();

    worker.terminate();

    expect(callbacks.onCancel).toHaveBeenCalledOnce();
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onFinish).toHaveBeenCalledWith(1);
  });
});
