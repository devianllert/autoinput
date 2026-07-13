import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { qKeys } from '@/shared/hotkeys/keys';

import { performInputTap } from '../../lib/automation/input';
import { getBatchSize } from '../loop';
import { PressClicker } from '../press-clicker';

vi.mock('../../lib/automation/input', () => ({
  performInputTap: vi.fn(),
}));

const performInputTapMock = vi.mocked(performInputTap);

const runClickerForOneSecond = async (clicksPerSecond: number): Promise<number> => {
  const clicker = new PressClicker();

  clicker.start(1000 / clicksPerSecond, [qKeys.MouseButton1]);
  await vi.advanceTimersByTimeAsync(1000);
  clicker.stop();

  return performInputTapMock.mock.calls.length;
};

describe('PressClicker CPS scheduling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    performInputTapMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([20, 50, 500, 1000])('keeps up with %i target CPS without native input', async (cps) => {
    const clicks = await runClickerForOneSecond(cps);

    expect(clicks).toBeGreaterThanOrEqual(cps);
    expect(clicks).toBeLessThanOrEqual(cps + getBatchSize(cps));
  });
});
