import { describe, expect, it, vi } from 'vitest';

import {
  AccessibilityPermission,
  type AccessibilityPermissionDependencies,
} from '../accessibility-permission';

vi.mock('electron', () => ({
  shell: {
    openExternal: vi.fn(() => Promise.resolve()),
  },
  systemPreferences: {
    isTrustedAccessibilityClient: vi.fn(() => false),
  },
}));

const createDependencies = (
  overrides: Partial<AccessibilityPermissionDependencies> = {},
): AccessibilityPermissionDependencies => ({
  platform: 'darwin',
  isTrustedAccessibilityClient: vi.fn(() => false),
  openExternal: vi.fn(() => Promise.resolve()),
  ...overrides,
});

describe('AccessibilityPermission', () => {
  it('does not require accessibility access outside macOS', () => {
    const dependencies = createDependencies({ platform: 'win32' });
    const permission = new AccessibilityPermission(dependencies);

    expect(permission.check()).toEqual({ required: false, granted: true });
    expect(permission.check(true)).toEqual({ required: false, granted: true });
    expect(dependencies.isTrustedAccessibilityClient).not.toHaveBeenCalled();
  });

  it('checks macOS access without prompting', () => {
    const dependencies = createDependencies({
      isTrustedAccessibilityClient: vi.fn(() => true),
    });
    const permission = new AccessibilityPermission(dependencies);

    expect(permission.check()).toEqual({ required: true, granted: true });
    expect(dependencies.isTrustedAccessibilityClient).toHaveBeenCalledWith(false);
  });

  it('requests macOS access with a system prompt', () => {
    const dependencies = createDependencies({
      isTrustedAccessibilityClient: vi.fn(() => false),
    });
    const permission = new AccessibilityPermission(dependencies);

    expect(permission.check(true)).toEqual({ required: true, granted: false });
    expect(dependencies.isTrustedAccessibilityClient).toHaveBeenCalledWith(true);
  });

  it('opens the macOS Accessibility settings pane', async () => {
    const dependencies = createDependencies();
    const permission = new AccessibilityPermission(dependencies);

    await permission.openSettings();

    expect(dependencies.openExternal).toHaveBeenCalledWith(
      expect.stringContaining('Privacy_Accessibility'),
    );
  });

  it('does not open System Settings outside macOS', async () => {
    const dependencies = createDependencies({ platform: 'linux' });
    const permission = new AccessibilityPermission(dependencies);

    await permission.openSettings();

    expect(dependencies.openExternal).not.toHaveBeenCalled();
  });
});
