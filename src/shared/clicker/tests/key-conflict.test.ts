import { describe, expect, it } from 'vitest';

import { qKeys } from '@/shared/hotkeys/keys';

import { findSharedKeys, getKeyConflictMessage } from '../key-conflict';

describe('clicker hotkey/input key conflict', () => {
  it('finds keys used by both the hotkey and the input', () => {
    expect(findSharedKeys([qKeys.Alt, qKeys.E], [qKeys.E])).toEqual([qKeys.E]);
    expect(findSharedKeys([qKeys.MouseButton1], [qKeys.Shift, qKeys.MouseButton1])).toEqual([
      qKeys.MouseButton1,
    ]);
  });

  it('reports no conflict for disjoint keys, including left vs right modifiers', () => {
    expect(findSharedKeys([qKeys.Alt, qKeys.E], [qKeys.MouseButton1])).toEqual([]);
    expect(findSharedKeys([qKeys.Alt], [qKeys.AltRight])).toEqual([]);
  });

  it('names the conflicting keys in the message', () => {
    expect(getKeyConflictMessage([qKeys.E, qKeys.MouseButton1])).toContain('E, Mouse Left');
  });
});
