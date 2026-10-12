import { describe, expect, it } from 'vitest';

import { clampCps } from '../limits';
import { cpsToRate, formatRate, rateToCps, type RateUnit } from '../rate';

describe('click rate conversion', () => {
  it.each<[number, RateUnit]>([
    [10, 'minute'],
    [7, 'minute'],
    [1, 'hour'],
    [90, 'hour'],
    [20, 'second'],
  ])('round-trips %d clicks per %s through the stored CPS', (rate, unit) => {
    const cps = clampCps(rateToCps(rate, unit));

    expect(formatRate(cpsToRate(cps, unit))).toBe(String(rate));
  });

  it('shows a slow rate in a faster unit without floating-point noise', () => {
    expect(formatRate(cpsToRate(rateToCps(10, 'minute'), 'second'))).toBe('0.166667');
    expect(formatRate(cpsToRate(0.5, 'hour'))).toBe('1800');
  });
});
