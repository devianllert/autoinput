import type { WindowTarget } from '@/shared/window-target/types';

import { getActiveWindowTarget } from '../lib/window-target/windows';
import { getWindowTargetConfig } from './store';

const ACTIVE_WINDOW_CHECK_MS = 250;

type WindowTargetGuardHandlers = {
  onWindowChanged?: (target: WindowTarget | null) => void;
  onTargetMismatch?: (target: WindowTarget | null) => void;
};

export class WindowTargetGuard {
  private timer: NodeJS.Timeout | null = null;
  private lastActiveTargetId: string | null = null;
  private handlers: WindowTargetGuardHandlers = {};

  public canRunInActiveWindow(): boolean {
    const { targetId } = getWindowTargetConfig();

    if (!targetId) {
      return true;
    }

    const activeWindow = getActiveWindowTarget();
    this.lastActiveTargetId = activeWindow?.id ?? null;

    return activeWindow?.id === targetId;
  }

  public start(handlers: WindowTargetGuardHandlers): void {
    this.handlers = handlers;

    if (!getWindowTargetConfig().targetId || this.timer) {
      return;
    }

    this.lastActiveTargetId = getActiveWindowTarget()?.id ?? null;

    this.timer = setInterval(() => {
      this.checkActiveWindow();
    }, ACTIVE_WINDOW_CHECK_MS);
  }

  public sync(): void {
    if (!getWindowTargetConfig().targetId) {
      this.stop();
      return;
    }

    if (!this.timer) {
      this.start(this.handlers);
    }

    this.checkActiveWindow();
  }

  public stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
    this.lastActiveTargetId = null;
  }

  private checkActiveWindow(): void {
    const activeWindow = getActiveWindowTarget();
    const activeTargetId = activeWindow?.id ?? null;

    if (activeTargetId !== this.lastActiveTargetId) {
      this.lastActiveTargetId = activeTargetId;
      this.handlers.onWindowChanged?.(activeWindow);
    }

    const { targetId } = getWindowTargetConfig();

    if (targetId && activeTargetId !== targetId) {
      this.handlers.onTargetMismatch?.(activeWindow);
    }
  }
}
