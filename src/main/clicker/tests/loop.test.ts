import { describe, expect, it } from 'vitest';

import { MAX_CLICKS_PER_SECOND } from '@/shared/clicker/limits';

import { getBatchDelayMs, getBatchSize, getSleepUntilDeadlineMs } from '../loop';

describe('getBatchSize', () => {
  it('returns 1 below 50 CPS', () => {
    expect(getBatchSize(49)).toBe(1);
    expect(getBatchSize(1)).toBe(1);
  });

  it(`returns 2 from 50 CPS up to the platform maximum`, () => {
    expect(getBatchSize(50)).toBe(2);
    expect(getBatchSize(MAX_CLICKS_PER_SECOND)).toBe(2);
  });
});

describe('getBatchDelayMs', () => {
  it('scales interval by batch size', () => {
    expect(getBatchDelayMs(10, 2)).toBe(20);
    expect(getBatchDelayMs(5, 3)).toBe(15);
  });
});

describe('getSleepUntilDeadlineMs', () => {
  it('returns remaining time until deadline', () => {
    expect(getSleepUntilDeadlineMs(100, 40)).toBe(60);
  });

  it('returns 0 when deadline has passed', () => {
    expect(getSleepUntilDeadlineMs(100, 150)).toBe(0);
  });
});
