import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClickerRunner } from '../worker-runner';

type WorkerCallbacks = {
  onMessage?: (message: unknown) => void;
  onError?: (error: Error) => void;
  onFinish?: (exitCode: number) => void;
};

const workerCallbacks: WorkerCallbacks[] = [];
const postMessage = vi.fn();

vi.mock('../../ipc/listeners', () => ({
  getHandlers: vi.fn(() => ({
    clickerStateChanged: {
      send: vi.fn(),
    },
  })),
}));

vi.mock('../../lib/enhanced-worker', () => ({
  enhancedWorker: vi.fn((_factory, options: WorkerCallbacks) => {
    workerCallbacks.push(options);

    return {
      postMessage,
    };
  }),
}));

vi.mock('../worker?nodeWorker', () => ({
  default: vi.fn(),
}));

vi.mock('../timer-resolution', () => ({
  enableHighResolutionTimer: vi.fn(() => true),
  disableHighResolutionTimer: vi.fn(),
}));

vi.mock('../../windows/main', () => ({
  getMainWindow: vi.fn(() => ({
    isDestroyed: () => true,
  })),
}));

describe('ClickerRunner', () => {
  beforeEach(() => {
    workerCallbacks.length = 0;
    postMessage.mockClear();
  });

  it('sends stop even when stop is called before the worker finishes starting', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    runner.stop();

    expect(runner.isRunning).toBe(false);
    expect(postMessage).toHaveBeenCalledWith('stop');
  });

  it('does not spawn a second worker while the first is still starting', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    runner.start(30);

    expect(workerCallbacks).toHaveLength(1);
  });

  it('marks running as soon as start is called', () => {
    const runner = new ClickerRunner();

    runner.start(20);

    expect(runner.isRunning).toBe(true);
  });
});
