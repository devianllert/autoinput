import { beforeEach, describe, expect, it, vi } from 'vitest';

type AppListener = (...arguments_: unknown[]) => void;
type MenuItem = { click?: () => void; label?: string; type?: string };

const mocks = vi.hoisted(() => ({
  appListeners: new Map<string, AppListener>(),
  enabled: false,
  menu: [] as MenuItem[],
  quit: vi.fn(),
  trayClick: undefined as (() => void) | undefined,
  traySetContextMenu: vi.fn(),
  traySetToolTip: vi.fn(),
}));

vi.mock('@egoist/tipc/main', () => {
  const action = (handler: unknown) => handler;

  return {
    tipc: {
      create: () => ({
        procedure: {
          action,
          input: () => ({ action }),
        },
      }),
    },
  };
});

vi.mock('electron', () => ({
  app: {
    getFileIcon: vi.fn(async () => Promise.resolve({ isEmpty: () => false })),
    getPath: vi.fn(() => 'C:\\AutoInput\\AutoInput.exe'),
    on: vi.fn((event: string, listener: AppListener) => {
      mocks.appListeners.set(event, listener);
    }),
    quit: mocks.quit,
  },
  Menu: {
    buildFromTemplate: vi.fn((template: MenuItem[]) => {
      mocks.menu = template;
      return template;
    }),
  },
  Tray: vi.fn(function MockTray() {
    return {
      on: vi.fn((event: string, listener: () => void) => {
        if (event === 'click') mocks.trayClick = listener;
      }),
      setContextMenu: mocks.traySetContextMenu,
      setToolTip: mocks.traySetToolTip,
    };
  }),
}));

vi.mock('../store', () => ({
  getMinimizeToTrayEnabled: () => mocks.enabled,
  setMinimizeToTrayEnabled: (enabled: boolean) => {
    mocks.enabled = enabled;
  },
}));

const importModule = async () => import('../index');

const createWindow = () => {
  let closeListener: ((event: { preventDefault(): void }) => void) | undefined;
  const window = {
    hide: vi.fn(),
    on: vi.fn((event: string, listener: (event: { preventDefault(): void }) => void) => {
      if (event === 'close') closeListener = listener;
    }),
  };

  return {
    close: (event: { preventDefault(): void }) => closeListener?.(event),
    window,
  };
};

describe('minimizeToTray', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.appListeners.clear();
    mocks.enabled = false;
    mocks.menu = [];
    mocks.quit.mockClear();
    mocks.trayClick = undefined;
    mocks.traySetContextMenu.mockClear();
    mocks.traySetToolTip.mockClear();
  });

  it('creates one persistent tray with open and quit actions', async () => {
    const showWindow = vi.fn();
    const { minimizeToTray } = await importModule();

    await minimizeToTray.setup(showWindow);
    await minimizeToTray.setup(showWindow);

    expect(mocks.traySetToolTip).toHaveBeenCalledOnce();
    mocks.trayClick?.();
    mocks.menu.find((item) => item.label === 'Open AutoInput')?.click?.();
    mocks.menu.find((item) => item.label === 'Quit')?.click?.();
    expect(showWindow).toHaveBeenCalledTimes(2);
    expect(mocks.quit).toHaveBeenCalledOnce();
  });

  it('hides the window on close only while the setting is enabled', async () => {
    const { minimizeToTray } = await importModule();
    const { close, window } = createWindow();
    const event = { preventDefault: vi.fn() };

    await minimizeToTray.setup(vi.fn());
    mocks.appListeners.get('browser-window-created')?.({}, window);
    close(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(window.hide).not.toHaveBeenCalled();

    expect(minimizeToTray.update(true)).toEqual({ enabled: true });
    close(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(window.hide).toHaveBeenCalledOnce();
  });

  it('allows the window to close while the application is quitting', async () => {
    const { minimizeToTray } = await importModule();
    const { close, window } = createWindow();
    const event = { preventDefault: vi.fn() };

    minimizeToTray.update(true);
    await minimizeToTray.setup(vi.fn());
    mocks.appListeners.get('browser-window-created')?.({}, window);
    mocks.appListeners.get('before-quit')?.();
    close(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(window.hide).not.toHaveBeenCalled();
  });
});
