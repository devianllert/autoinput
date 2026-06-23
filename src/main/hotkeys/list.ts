import { getClickerTiming } from '../clicker/store';
import { autoClicker } from '../clicker/worker-runner';
import { HotkeyRegistration, qKeys } from '../lib/hotkeys/hotkeys';

export type Hotkey = HotkeyRegistration & {
  name: string;
};

export type StoredHotkey = Omit<Hotkey, 'onPress' | 'onRelease'>;

export const defaultHotkeyList = [
  {
    name: 'test' as const,
    keys: [qKeys.Ctrl, qKeys.Shift, qKeys.P],
    onPress: () => console.log('test'),
    mode: 'press',
  },
  {
    name: 'clicker-start' as const,
    keys: [qKeys.Alt, qKeys.E],
    onPress: () => autoClicker.start(getClickerTiming().cps),
    onRelease: () => autoClicker.stop(),
    mode: 'hold',
  },
] satisfies Hotkey[];
