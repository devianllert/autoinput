import { Conf } from 'electron-conf';

import { defaultHotkeyList, StoredHotkey } from './list';

const defaultStoredHotkeys: StoredHotkey[] = defaultHotkeyList.map(({ name, keys, mode }) => ({
  name,
  keys,
  mode,
}));

const HotkeysStore = new Conf<{
  hotkeys: StoredHotkey[];
}>({
  name: 'hotkeys',
  defaults: {
    hotkeys: defaultStoredHotkeys,
  },
});

export const getHotkeys = (): StoredHotkey[] => {
  return HotkeysStore.get('hotkeys', defaultStoredHotkeys);
};

export const updateHotkey = (hotkey: StoredHotkey) => {
  const hotkeys = getHotkeys();
  const index = hotkeys.findIndex((h) => h.name === hotkey.name);

  if (index === -1) {
    throw new Error(`Hotkey ${hotkey.name} not found`);
  }

  hotkeys[index] = hotkey;
  HotkeysStore.set('hotkeys', hotkeys);
};
