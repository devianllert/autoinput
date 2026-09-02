import { Conf } from 'electron-conf/main';

type SettingsStore = {
  minimizeToTray: boolean;
};

const DEFAULT_MINIMIZE_TO_TRAY = false;

const settingsStore = new Conf<SettingsStore>({
  name: 'settings',
  defaults: {
    minimizeToTray: DEFAULT_MINIMIZE_TO_TRAY,
  },
});

export const getMinimizeToTrayEnabled = (): boolean => {
  return settingsStore.get('minimizeToTray', DEFAULT_MINIMIZE_TO_TRAY);
};

export const setMinimizeToTrayEnabled = (enabled: boolean): void => {
  settingsStore.set('minimizeToTray', enabled);
};
