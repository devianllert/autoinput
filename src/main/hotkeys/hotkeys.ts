import { HotkeyRegistration, Hotkeys } from '../lib/hotkeys/hotkeys';
import { defaultHotkeyList } from './list';
import { getHotkeys } from './store';

const hotkeys = new Hotkeys();

export const registerHotkeys = (): Hotkeys => {
  hotkeys.unregisterAll();

  const savedHotkeys = getHotkeys();

  savedHotkeys.forEach((hotkey) => {
    const defaultHotkey = defaultHotkeyList.find((h) => h.name === hotkey.name);

    if (!defaultHotkey) {
      console.warn(`Hotkey ${hotkey.name} not found in default hotkey list`);
      return;
    }

    const hotkeyRegistration: HotkeyRegistration = {
      keys: hotkey.keys,
      mode: hotkey.mode,
      onPress: defaultHotkey.onPress,
      onRelease: defaultHotkey.onRelease,
    };

    hotkeys.register(hotkeyRegistration);
  });

  return hotkeys;
};
