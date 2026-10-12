import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClickerWorkerMessage } from '../worker-protocol';

const mocks = vi.hoisted(() => {
  let handler: ((message: unknown) => void) | null = null;

  return {
    port: {
      on: vi.fn((_event: string, callback: (message: unknown) => void) => {
        handler = callback;
      }),
    },
    send: (message: unknown) => handler?.(message),
    createClicker: vi.fn(),
  };
});

vi.mock('node:worker_threads', () => ({ parentPort: mocks.port }));
vi.mock('../clicker', () => ({ createClicker: mocks.createClicker }));

const send = (message: ClickerWorkerMessage) => mocks.send(message);

const createFakeClicker = () => ({ running: false, start: vi.fn(), stop: vi.fn() });

describe('clicker worker', () => {
  beforeEach(async () => {
    vi.resetModules();
    mocks.createClicker.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await import('../worker');
  });

  it('starts and stops clickers in message order', () => {
    const first = createFakeClicker();
    const second = createFakeClicker();
    mocks.createClicker.mockReturnValueOnce(first).mockReturnValueOnce(second);

    send({ type: 'start', intervalMs: 50, config: { keys: [1], mode: 'hold' } });
    send({ type: 'stop' });
    send({ type: 'start', intervalMs: 10, config: { keys: [2], mode: 'press' } });

    expect(mocks.createClicker.mock.calls).toEqual([['hold'], ['press']]);
    expect(first.start).toHaveBeenCalledWith(50, [1]);
    expect(first.stop).toHaveBeenCalledOnce();
    expect(second.start).toHaveBeenCalledWith(10, [2]);
    expect(second.stop).not.toHaveBeenCalled();
  });

  it('fails loudly on start while a clicker is already running', () => {
    mocks.createClicker.mockReturnValue(createFakeClicker());

    send({ type: 'start', intervalMs: 50, config: { keys: [1], mode: 'press' } });

    expect(() =>
      send({ type: 'start', intervalMs: 50, config: { keys: [1], mode: 'press' } }),
    ).toThrow('already running');
  });

  it('releases input before exiting on shutdown', () => {
    const clicker = createFakeClicker();
    mocks.createClicker.mockReturnValue(clicker);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    send({ type: 'start', intervalMs: 50, config: { keys: [1], mode: 'hold' } });
    send({ type: 'shutdown' });

    expect(clicker.stop).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledWith(0);
    expect(clicker.stop.mock.invocationCallOrder[0]).toBeLessThan(
      exit.mock.invocationCallOrder[0] ?? 0,
    );
  });
});
