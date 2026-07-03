import { describe, expect, it } from 'vitest';

import { qKeys } from '@/shared/hotkeys/keys';

import { DEFAULT_CLICKER_CONFIG, sanitizeClickerConfig } from '../config';

describe('sanitizeClickerConfig', () => {
  it('returns the default when keys are empty or unknown', () => {
    expect(sanitizeClickerConfig({ keys: [], mode: 'press' })).toEqual(DEFAULT_CLICKER_CONFIG);
    expect(sanitizeClickerConfig({ keys: [0xffff], mode: 'press' })).toEqual(
      DEFAULT_CLICKER_CONFIG,
    );
  });

  it('deduplicates and sorts keys', () => {
    expect(
      sanitizeClickerConfig({
        keys: [qKeys.A, qKeys.Ctrl, qKeys.A],
        mode: 'press',
      }),
    ).toEqual({
      keys: [qKeys.Ctrl, qKeys.A],
      mode: 'press',
    });
  });

  it('filters known keys that the clicker cannot emit', () => {
    expect(
      sanitizeClickerConfig({
        keys: [qKeys.Ctrl, qKeys.Semicolon, qKeys.MouseButton4, qKeys.A],
        mode: 'press',
      }),
    ).toEqual({
      keys: [qKeys.Ctrl, qKeys.A],
      mode: 'press',
    });

    expect(sanitizeClickerConfig({ keys: [qKeys.F24], mode: 'press' })).toEqual(
      DEFAULT_CLICKER_CONFIG,
    );
  });

  it('normalizes invalid modes to press', () => {
    expect(
      sanitizeClickerConfig({
        keys: [qKeys.MouseButton2],
        mode: 'toggle' as 'press',
      }),
    ).toEqual({
      keys: [qKeys.MouseButton2],
      mode: 'press',
    });
  });
});
