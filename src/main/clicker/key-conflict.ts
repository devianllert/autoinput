import { findSharedKeys, getKeyConflictMessage } from '@/shared/clicker/key-conflict';

/** Rejects settings where the clicker would press a key of its own hotkey. */
export const assertNoKeyConflict = (hotkeyKeys: number[], inputKeys: number[]): void => {
  const sharedKeys = findSharedKeys(hotkeyKeys, inputKeys);

  if (sharedKeys.length > 0) {
    throw new Error(getKeyConflictMessage(sharedKeys));
  }
};
