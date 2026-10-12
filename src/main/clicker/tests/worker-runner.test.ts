import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WindowTarget, WindowTargetConfig } from '@/shared/window-target/types';

import { ClickerRunner } from '../worker-runner';

type WorkerCallbacks = {
  onMessage?: (message: unknown) => void;
  onError?: (error: Error) => void;
  onFinish?: (exitCode: number) => void;
};

const { powerSaveBlockerStart, powerSaveBlockerStop } = vi.hoisted(() => ({
  powerSaveBlockerStart: vi.fn(() => 1),
  powerSaveBlockerStop: vi.fn(),
}));

const { getWindowTargetConfig, getActiveWindowTarget } = vi.hoisted(() => ({
  getWindowTargetConfig: vi.fn<() => WindowTargetConfig>(() => ({ targetId: null })),
  getActiveWindowTarget: vi.fn<() => WindowTarget | null>(() => null),
}));

const workerCallbacks: WorkerCallbacks[] = [];
const postMessage = vi.fn();

vi.mock('electron', () => ({
  powerSaveBlocker: {
    start: powerSaveBlockerStart,
    stop: powerSaveBlockerStop,
  },
}));

vi.mock('../../ipc/listeners', () => ({
  getHandlers: vi.fn(() => ({
    clickerStateChanged: {
      send: vi.fn(),
    },
  })),
}));

vi.mock('../../lib/enhanced-worker', () => ({
  enhancedWorker: vi.fn((_factory, options: WorkerCallbacks) => {
    let resolveExited = (): void => undefined;
    const exited = new Promise<void>((resolve) => {
      resolveExited = resolve;
    });

    workerCallbacks.push({
      ...options,
      onFinish: (exitCode) => {
        options.onFinish?.(exitCode);
        resolveExited();
      },
    });

    return {
      postMessage,
      exited,
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

vi.mock('../store', () => ({
  getClickerConfig: vi.fn(() => ({
    keys: [1],
    mode: 'press' as const,
  })),
  getWindowTargetConfig,
}));

vi.mock('../../lib/window-target/windows', () => ({
  getActiveWindowTarget,
}));

vi.mock('../../windows/main', () => ({
  findMainWindow: vi.fn(() => null),
}));

describe('ClickerRunner', () => {
  const minecraftTarget: WindowTarget = {
    id: 'minecraft.exe',
    title: 'Minecraft',
    processName: 'minecraft.exe',
    processPath: null,
  };
  const notepadTarget: WindowTarget = {
    id: 'notepad.exe',
    title: 'Notepad',
    processName: 'notepad.exe',
    processPath: null,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    workerCallbacks.length = 0;
    postMessage.mockClear();
    powerSaveBlockerStart.mockClear();
    powerSaveBlockerStop.mockClear();
    getWindowTargetConfig.mockReturnValue({ targetId: null });
    getActiveWindowTarget.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const startMessage = { type: 'start', intervalMs: 50, config: { keys: [1], mode: 'press' } };

  it('posts start and stop to the worker and tracks running state', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    expect(runner.isRunning).toBe(true);

    runner.stop();

    expect(runner.isRunning).toBe(false);
    expect(postMessage.mock.calls).toEqual([[startMessage], [{ type: 'stop' }]]);
  });

  it('reuses one worker and keeps every message of a rapid on/off sequence in order', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    runner.stop();
    runner.start(20);
    runner.stop();
    runner.start(20);

    expect(workerCallbacks).toHaveLength(1);
    expect(runner.isRunning).toBe(true);
    expect(postMessage.mock.calls).toEqual([
      [startMessage],
      [{ type: 'stop' }],
      [startMessage],
      [{ type: 'stop' }],
      [startMessage],
    ]);
  });

  it('ignores start while already running', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    runner.start(30);

    expect(postMessage).toHaveBeenCalledOnce();
  });

  it('blocks display sleep only while running', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    runner.stop();

    expect(powerSaveBlockerStart).toHaveBeenCalledWith('prevent-display-sleep');
    expect(powerSaveBlockerStop).toHaveBeenCalledWith(1);
  });

  it('resets state and recreates the worker after a crash', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    workerCallbacks[0]?.onFinish?.(1);

    expect(runner.isRunning).toBe(false);
    expect(runner.hasWorker).toBe(false);
    expect(powerSaveBlockerStop).toHaveBeenCalledOnce();

    runner.start(20);

    expect(workerCallbacks).toHaveLength(2);
    expect(runner.isRunning).toBe(true);
  });

  it('resolves shutdown only after the worker exits and refuses to start afterwards', async () => {
    const runner = new ClickerRunner();
    const onShutdown = vi.fn();

    runner.start(20);
    const shutdown = runner.shutdown().then(onShutdown);
    await Promise.resolve();

    expect(runner.isRunning).toBe(false);
    expect(postMessage).toHaveBeenLastCalledWith({ type: 'shutdown' });
    expect(onShutdown).not.toHaveBeenCalled();

    workerCallbacks[0]?.onFinish?.(0);
    await shutdown;

    expect(onShutdown).toHaveBeenCalledOnce();
    expect(runner.hasWorker).toBe(false);

    runner.start(20);

    expect(workerCallbacks).toHaveLength(1);
    expect(runner.isRunning).toBe(false);
  });

  it('does not start when a selected target does not match the active window', () => {
    getWindowTargetConfig.mockReturnValue({ targetId: 'minecraft.exe' });
    getActiveWindowTarget.mockReturnValue(notepadTarget);

    const runner = new ClickerRunner();

    runner.start(20);

    expect(runner.isRunning).toBe(false);
    expect(workerCallbacks).toHaveLength(0);
  });

  it('stops when the selected target no longer matches after guard sync', () => {
    getWindowTargetConfig.mockReturnValue({ targetId: 'minecraft.exe' });
    getActiveWindowTarget.mockReturnValue(minecraftTarget);

    const runner = new ClickerRunner();

    runner.start(20);
    getActiveWindowTarget.mockReturnValue(notepadTarget);
    runner.applyWindowTargetConfig();

    expect(runner.isRunning).toBe(false);
    expect(postMessage).toHaveBeenLastCalledWith({ type: 'stop' });
  });

  it('stops when the active window changes to a different target', () => {
    getWindowTargetConfig.mockReturnValue({ targetId: 'minecraft.exe' });
    getActiveWindowTarget.mockReturnValue(minecraftTarget);

    const runner = new ClickerRunner();

    runner.start(20);
    getActiveWindowTarget.mockReturnValue(notepadTarget);
    vi.advanceTimersByTime(250);

    expect(runner.isRunning).toBe(false);
    expect(postMessage).toHaveBeenLastCalledWith({ type: 'stop' });
  });
});
