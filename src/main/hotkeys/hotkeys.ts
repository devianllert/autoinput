import { HotkeyRegistration, Hotkeys } from '../lib/hotkeys/hotkeys';
import { defaultHotkeyList } from './list';
import { getHotkeys } from './store';

const hotkeys = new Hotkeys();

export const registerHotkeys = () => {
  hotkeys.unregisterAll();

  const savedHotkeys = getHotkeys();

  savedHotkeys.forEach((hotkey) => {
    const defaultHotkey = defaultHotkeyList.find(
      (h) => h.name === hotkey.name,
    ) as HotkeyRegistration;

    if (!defaultHotkey) {
      throw new Error(`Hotkey ${hotkey.name} not found`);
    }

    const hotkeyRegistration: HotkeyRegistration = {
      keys: hotkey.keys,
      mode: hotkey.mode,
      onPress: defaultHotkey.onPress,
      onRelease: defaultHotkey.onRelease,
    };

    hotkeys.register(hotkeyRegistration);
  });

  hotkeys.stop();
  hotkeys.run();
};
