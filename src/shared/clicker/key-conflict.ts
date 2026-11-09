import { formatHotkeyKeys } from '@/shared/hotkeys/keys';

/** Name of the stored hotkey that starts and stops the clicker. */
export const CLICKER_HOTKEY_NAME = 'clicker-start';

/**
 * Keys present both in the clicker hotkey and in the clicker input.
 *
 * Synthetic presses cannot be told apart from real ones, so a shared key would make
 * the clicker release or re-trigger its own hotkey.
 */
export const findSharedKeys = (hotkeyKeys: number[], inputKeys: number[]): number[] =>
  hotkeyKeys.filter((key) => inputKeys.includes(key));

export const getKeyConflictMessage = (sharedKeys: number[]): string => {
  const keyNames = sharedKeys.map((key) => formatHotkeyKeys([key])).join(', ');

  return `${keyNames} can't be in both the hotkey and the input: the clicker's own presses would switch it off. Choose different keys.`;
};
