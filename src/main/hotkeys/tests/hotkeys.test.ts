import { describe, expect, it, vi } from 'vitest';

import { registerHotkeys } from '../hotkeys';

const mocks = vi.hoisted(() => ({
  getHotkeys: vi.fn(),
  register: vi.fn(),
  unregisterAll: vi.fn(),
  onPress: vi.fn(),
}));

vi.mock('../../lib/hotkeys/hotkeys', () => ({
  Hotkeys: class {
    register = mocks.register;
    unregisterAll = mocks.unregisterAll;
  },
}));

vi.mock('../list', () => ({
  defaultHotkeyList: [{ name: 'clicker-start', keys: [1], mode: 'press', onPress: mocks.onPress }],
}));

vi.mock('../store', () => ({
  getHotkeys: mocks.getHotkeys,
}));

describe('registerHotkeys', () => {
  it('ignores saved hotkeys absent from the current app and registers known ones', () => {
    mocks.getHotkeys.mockReturnValue([
      { name: 'chain-start', keys: [2], mode: 'press' },
      { name: 'clicker-start', keys: [3], mode: 'hold' },
    ]);

    expect(() => registerHotkeys()).not.toThrow();
    expect(mocks.unregisterAll).toHaveBeenCalledOnce();
    expect(mocks.register).toHaveBeenCalledExactlyOnceWith({
      keys: [3],
      mode: 'hold',
      onPress: mocks.onPress,
      onRelease: undefined,
    });
  });
});
