import { BrowserWindow } from 'electron';
import { Conf } from 'electron-conf/main';

type WindowPosition = {
  x?: number;
  y?: number;
};

type WindowState = {
  position?: WindowPosition;
};

type WindowsStoreSchema = {
  windows: Record<string, WindowState>;
};

export class WindowStateStore {
  private readonly conf: Conf<WindowsStoreSchema>;

  constructor(name = 'window-state') {
    this.conf = new Conf<WindowsStoreSchema>({
      name,
      defaults: {
        windows: {},
      },
    });
  }

  getPosition(windowKey: string): Required<WindowPosition> | undefined {
    const state = this.conf.get('windows', {})[windowKey];
    const position = state?.position;

    if (typeof position?.x === 'number' && typeof position.y === 'number') {
      return {
        x: position.x,
        y: position.y,
      };
    }

    return undefined;
  }

  savePosition(windowKey: string, window: BrowserWindow): void {
    const windows = this.conf.get('windows', {});
    const currentState = windows[windowKey] ?? {};
    const { x, y } = window.getBounds();

    this.conf.set('windows', {
      ...windows,
      [windowKey]: {
        ...currentState,
        position: { x, y },
      },
    });
  }

  bindPositionPersistence(windowKey: string, window: BrowserWindow): void {
    window.on('move', () => {
      this.savePosition(windowKey, window);
    });
  }
}

export const windowStateStore = new WindowStateStore();
