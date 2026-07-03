import { describe, expect, it, vi } from 'vitest';

import { createClicker } from '../clicker';
import { HoldClicker } from '../hold-clicker';
import { PressClicker } from '../press-clicker';

vi.mock('../input', () => ({
  performInputTap: vi.fn(),
  performInputDown: vi.fn(),
  performInputUp: vi.fn(),
}));

describe('createClicker', () => {
  it('creates PressClicker for press mode', () => {
    expect(createClicker('press')).toBeInstanceOf(PressClicker);
  });

  it('creates HoldClicker for hold mode', () => {
    expect(createClicker('hold')).toBeInstanceOf(HoldClicker);
  });
});
