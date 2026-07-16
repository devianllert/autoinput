import { describe, expect, it, vi } from 'vitest';

import { AutoLaunch, type AutoLaunchDependencies } from '../auto-launch';

vi.mock('electron', () => ({
  app: {
    isPackaged: true,
    isInApplicationsFolder: () => true,
    getLoginItemSettings: () => ({ openAtLogin: false, executableWillLaunchAtLogin: false }),
    setLoginItemSettings: () => undefined,
  },
}));

const createDependencies = (
  overrides: Partial<AutoLaunchDependencies> = {},
): AutoLaunchDependencies => {
  return {
    isPackaged: true,
    platform: 'win32',
    portableExecutableFile: undefined,
    isInApplicationsFolder: vi.fn(() => true),
    getLoginItemSettings: vi.fn(() => ({
      openAtLogin: false,
      executableWillLaunchAtLogin: false,
    })),
    setLoginItemSettings: vi.fn(),
    ...overrides,
  };
};

describe('AutoLaunchController', () => {
  it.each([
    {
      name: 'development',
      isPackaged: false,
      platform: 'win32' as const,
      portable: undefined,
      inApplications: true,
    },
    {
      name: 'portable',
      isPackaged: true,
      platform: 'win32' as const,
      portable: 'C:\\Tools\\autoclicker.exe',
      inApplications: true,
    },
    {
      name: 'macOS outside Applications',
      isPackaged: true,
      platform: 'darwin' as const,
      portable: undefined,
      inApplications: false,
    },
    {
      name: 'unsupported platform',
      isPackaged: true,
      platform: 'linux' as const,
      portable: undefined,
      inApplications: true,
    },
  ])('is unavailable in $name mode', ({ isPackaged, platform, portable, inApplications }) => {
    const dependencies = createDependencies({
      isPackaged,
      platform,
      portableExecutableFile: portable,
      isInApplicationsFolder: vi.fn(() => inApplications),
    });
    const controller = new AutoLaunch(dependencies);

    expect(controller.getState()).toEqual({ available: false, enabled: false });
    expect(dependencies.getLoginItemSettings).not.toHaveBeenCalled();
    expect(() => controller.update(true)).toThrow(
      'Auto-launch is only available for an installed app.',
    );
    expect(dependencies.setLoginItemSettings).not.toHaveBeenCalled();
  });

  it('reports the effective Windows state after Task Manager approval', () => {
    const controller = new AutoLaunch(
      createDependencies({
        getLoginItemSettings: vi.fn(() => ({
          openAtLogin: true,
          executableWillLaunchAtLogin: false,
        })),
      }),
    );

    expect(controller.getState()).toEqual({ available: true, enabled: false });
  });

  it('reports the macOS open-at-login state for an app in Applications', () => {
    const controller = new AutoLaunch(
      createDependencies({
        platform: 'darwin',
        getLoginItemSettings: vi.fn(() => ({
          openAtLogin: true,
          executableWillLaunchAtLogin: false,
        })),
      }),
    );

    expect(controller.getState()).toEqual({ available: true, enabled: true });
  });

  it.each([
    {
      platform: 'win32' as const,
      enabled: true,
      expected: { openAtLogin: true, enabled: true },
    },
    { platform: 'win32' as const, enabled: false, expected: { openAtLogin: false } },
    { platform: 'darwin' as const, enabled: true, expected: { openAtLogin: true } },
    { platform: 'darwin' as const, enabled: false, expected: { openAtLogin: false } },
  ])('updates $platform login item when enabled is $enabled', ({ platform, enabled, expected }) => {
    let effectiveState = !enabled;
    const setLoginItemSettings = vi.fn(() => {
      effectiveState = enabled;
    });
    const controller = new AutoLaunch(
      createDependencies({
        platform,
        getLoginItemSettings: () => ({
          openAtLogin: effectiveState,
          executableWillLaunchAtLogin: effectiveState,
        }),
        setLoginItemSettings,
      }),
    );

    expect(controller.update(enabled)).toEqual({ available: true, enabled });
    expect(setLoginItemSettings).toHaveBeenCalledWith(expected);
  });
});
