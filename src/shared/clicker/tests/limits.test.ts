import { describe, expect, it } from 'vitest';

import {
  clampCps,
  DEFAULT_CLICKS_PER_SECOND,
  MAX_CLICKS_PER_SECOND,
  MIN_CLICKS_PER_SECOND,
} from '../limits';

describe('clampCps', () => {
  it('returns the value when it is within range', () => {
    expect(clampCps(20)).toBe(20);
    expect(clampCps(MIN_CLICKS_PER_SECOND)).toBe(MIN_CLICKS_PER_SECOND);
    expect(clampCps(MAX_CLICKS_PER_SECOND)).toBe(MAX_CLICKS_PER_SECOND);
  });

  it('clamps values below the minimum and above the maximum', () => {
    expect(clampCps(0)).toBe(MIN_CLICKS_PER_SECOND);
    expect(clampCps(-10)).toBe(MIN_CLICKS_PER_SECOND);
    expect(clampCps(999)).toBe(MAX_CLICKS_PER_SECOND);
  });

  it('falls back to the default for non-finite values', () => {
    expect(clampCps(Number.NaN)).toBe(DEFAULT_CLICKS_PER_SECOND);
    expect(clampCps(Number.POSITIVE_INFINITY)).toBe(DEFAULT_CLICKS_PER_SECOND);
    expect(clampCps(Number.NEGATIVE_INFINITY)).toBe(DEFAULT_CLICKS_PER_SECOND);
  });
});
