import { beforeEach, describe, expect, it, vi } from 'vitest';

type MenuItem = { click?: () => void; label?: string; type?: string };

const mocks = vi.hoisted(() => ({
  iconIsEmpty: vi.fn(() => false),
  menu: [] as MenuItem[],
  quit: vi.fn(),
  trayClick: undefined as (() => void) | undefined,
  traySetContextMenu: vi.fn(),
  traySetToolTip: vi.fn(),
}));

vi.mock('electron', () => ({
  app: { quit: mocks.quit },
  nativeImage: {
    createFromPath: vi.fn(() => ({
      isEmpty: mocks.iconIsEmpty,
      resize: vi.fn(() => ({ resized: true })),
    })),
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

describe('appTray', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.iconIsEmpty.mockReset().mockReturnValue(false);
    mocks.menu = [];
    mocks.quit.mockClear();
    mocks.trayClick = undefined;
    mocks.traySetContextMenu.mockClear();
    mocks.traySetToolTip.mockClear();
  });

  it('creates one persistent tray with open and quit actions', async () => {
    const showWindow = vi.fn();
    const { appTray } = await import('../index');

    appTray.setup(showWindow);
    appTray.setup(showWindow);

    expect(mocks.traySetToolTip).toHaveBeenCalledOnce();
    mocks.trayClick?.();
    mocks.menu.find((item) => item.label === 'Open AutoInput')?.click?.();
    mocks.menu.find((item) => item.label === 'Quit')?.click?.();
    expect(showWindow).toHaveBeenCalledTimes(2);
    expect(mocks.quit).toHaveBeenCalledOnce();
  });

  it('fails synchronously if the bundled tray icon cannot be loaded', async () => {
    const { appTray } = await import('../index');
    mocks.iconIsEmpty.mockReturnValue(true);

    expect(() => appTray.setup(vi.fn())).toThrow(
      'Could not load the application icon for the system tray.',
    );
    expect(mocks.traySetToolTip).not.toHaveBeenCalled();
  });
});
