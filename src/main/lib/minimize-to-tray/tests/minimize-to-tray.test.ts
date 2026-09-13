import { beforeEach, describe, expect, it, vi } from 'vitest';

type AppListener = (...arguments_: unknown[]) => void;

const mocks = vi.hoisted(() => ({
  appListeners: new Map<string, AppListener>(),
  enabled: false,
}));

vi.mock('electron', () => ({
  app: {
    on: vi.fn((event: string, listener: AppListener) => {
      mocks.appListeners.set(event, listener);
    }),
  },
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
  });

  it('hides the window on close only while the setting is enabled', async () => {
    const { minimizeToTray } = await importModule();
    const { close, window } = createWindow();
    const event = { preventDefault: vi.fn() };

    minimizeToTray.setup();
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
    minimizeToTray.setup();
    mocks.appListeners.get('browser-window-created')?.({}, window);
    mocks.appListeners.get('before-quit')?.();
    close(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(window.hide).not.toHaveBeenCalled();
  });
});
