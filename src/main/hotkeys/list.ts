import { HotkeyRegistration, qKeys } from '../lib/hotkeys/hotkeys';

export type Hotkey = HotkeyRegistration & {
  name: string;
};

export type StoredHotkey = Omit<Hotkey, 'onPress' | 'onRelease'>;

export const defaultHotkeyList = [
  {
    name: 'test' as const,
    keys: [qKeys.Ctrl, qKeys.Shift, qKeys.P],
    onPress: () => console.log('ping'),
    mode: 'press',
  },
  {
    name: 'clicker-start' as const,
    keys: [qKeys.Alt, qKeys.E],
    onPress: () => console.log('clicker start'),
    onRelease: () => console.log('clicker stop'),
    mode: 'hold',
  },
] satisfies Hotkey[];
