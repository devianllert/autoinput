import type { WindowTarget, WindowTargetConfig } from '@/shared/window-target/types';

import { getActiveWindowTarget } from '../lib/window-target/windows';

const ACTIVE_WINDOW_CHECK_MS = 250;

type WindowTargetGuardHandlers = {
  onWindowChanged?: (target: WindowTarget | null) => void;
  onTargetMismatch?: (target: WindowTarget | null) => void;
};

export class WindowTargetGuard {
  private timer: NodeJS.Timeout | null = null;
  private lastActiveTargetId: string | null = null;
  private targetId: string | null = null;
  private handlers: WindowTargetGuardHandlers = {};

  public setTarget(config: WindowTargetConfig): void {
    this.targetId = config.targetId || null;
  }

  public canRunInActiveWindow(): boolean {
    if (!this.targetId) {
      return true;
    }

    const activeWindow = getActiveWindowTarget();
    this.lastActiveTargetId = activeWindow?.id ?? null;

    return activeWindow?.id === this.targetId;
  }

  public start(handlers: WindowTargetGuardHandlers): void {
    this.handlers = handlers;

    if (!this.targetId || this.timer) {
      return;
    }

    this.lastActiveTargetId = getActiveWindowTarget()?.id ?? null;

    this.timer = setInterval(() => {
      this.checkActiveWindow();
    }, ACTIVE_WINDOW_CHECK_MS);
  }

  public sync(): void {
    if (!this.targetId) {
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

    if (this.targetId && activeTargetId !== this.targetId) {
      this.handlers.onTargetMismatch?.(activeWindow);
    }
  }
}
