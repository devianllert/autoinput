import { shell, systemPreferences } from 'electron';

import type { AccessibilityPermissionState } from '@/shared/permissions/types';

const ACCESSIBILITY_SETTINGS_URL =
  'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility';

export type AccessibilityPermissionDependencies = {
  platform: NodeJS.Platform;
  isTrustedAccessibilityClient: (prompt: boolean) => boolean;
  openExternal: (url: string) => Promise<void>;
};

export class AccessibilityPermission {
  constructor(private readonly dependencies: AccessibilityPermissionDependencies) {}

  check(prompt = false): AccessibilityPermissionState {
    const required = this.dependencies.platform === 'darwin';

    return {
      required,
      granted: !required || this.dependencies.isTrustedAccessibilityClient(prompt),
    };
  }

  async openSettings(): Promise<void> {
    if (this.dependencies.platform !== 'darwin') {
      return;
    }

    await this.dependencies.openExternal(ACCESSIBILITY_SETTINGS_URL);
  }
}

export const accessibilityPermission = new AccessibilityPermission({
  platform: process.platform,
  isTrustedAccessibilityClient: (prompt) => systemPreferences.isTrustedAccessibilityClient(prompt),
  openExternal: (url) => shell.openExternal(url),
});
