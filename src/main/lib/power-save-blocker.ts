import { powerSaveBlocker } from 'electron';

export class PowerSaveBlocker {
  private blockerId: number | null = null;

  start(): void {
    if (this.blockerId !== null) {
      return;
    }

    this.blockerId = powerSaveBlocker.start('prevent-display-sleep');
  }

  stop(): void {
    if (this.blockerId === null) {
      return;
    }

    powerSaveBlocker.stop(this.blockerId);
    this.blockerId = null;
  }
}
