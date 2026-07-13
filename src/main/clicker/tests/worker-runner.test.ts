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
  getMainWindow: vi.fn(() => ({
    isDestroyed: () => true,
  })),
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

  it('blocks display sleep only while the worker is running', () => {
    const runner = new ClickerRunner();

    runner.start(20);
    workerCallbacks[0]?.onFinish?.(0);

    expect(powerSaveBlockerStart).toHaveBeenCalledWith('prevent-display-sleep');
    expect(powerSaveBlockerStop).toHaveBeenCalledWith(1);
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
    expect(postMessage).toHaveBeenCalledWith('stop');
  });

  it('stops when the active window changes to a different target', () => {
    getWindowTargetConfig.mockReturnValue({ targetId: 'minecraft.exe' });
    getActiveWindowTarget.mockReturnValue(minecraftTarget);

    const runner = new ClickerRunner();

    runner.start(20);
    getActiveWindowTarget.mockReturnValue(notepadTarget);
    vi.advanceTimersByTime(250);

    expect(runner.isRunning).toBe(false);
    expect(postMessage).toHaveBeenCalledWith('stop');
  });
});
