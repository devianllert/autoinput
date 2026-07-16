import { app } from 'electron';

import type { AutoLaunchState } from '@/shared/settings/types';

type LoginItemState = {
  openAtLogin: boolean;
  executableWillLaunchAtLogin: boolean;
};

type LoginItemUpdate = {
  openAtLogin: boolean;
  enabled?: boolean;
};

export type AutoLaunchDependencies = {
  isPackaged: boolean;
  platform: NodeJS.Platform;
  portableExecutableFile: string | undefined;
  isInApplicationsFolder: () => boolean;
  getLoginItemSettings: () => LoginItemState;
  setLoginItemSettings: (settings: LoginItemUpdate) => void;
};

export class AutoLaunch {
  constructor(private readonly dependencies: AutoLaunchDependencies) {}

  getState(): AutoLaunchState {
    if (!this.isAvailable()) {
      return { available: false, enabled: false };
    }

    const loginItemState = this.dependencies.getLoginItemSettings();

    return {
      available: true,
      enabled:
        this.dependencies.platform === 'win32'
          ? loginItemState.executableWillLaunchAtLogin
          : loginItemState.openAtLogin,
    };
  }

  update(enabled: boolean): AutoLaunchState {
    if (!this.isAvailable()) {
      throw new Error('Auto-launch is only available for an installed app.');
    }

    this.dependencies.setLoginItemSettings(
      enabled && this.dependencies.platform === 'win32'
        ? { openAtLogin: true, enabled: true }
        : { openAtLogin: enabled },
    );

    return this.getState();
  }

  private isAvailable(): boolean {
    const { isPackaged, platform, portableExecutableFile, isInApplicationsFolder } =
      this.dependencies;

    if (!isPackaged) return false;
    if (platform === 'win32') return portableExecutableFile === undefined;
    if (platform === 'darwin') return isInApplicationsFolder();

    return false;
  }
}

export const autoLaunch = new AutoLaunch({
  isPackaged: app.isPackaged,
  platform: process.platform,
  portableExecutableFile: process.env.PORTABLE_EXECUTABLE_FILE,
  isInApplicationsFolder: () => app.isInApplicationsFolder(),
  getLoginItemSettings: () => app.getLoginItemSettings(),
  setLoginItemSettings: (settings) => app.setLoginItemSettings(settings),
});
