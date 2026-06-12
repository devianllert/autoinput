import {
  uIOhook,
  type UiohookKeyboardEvent,
  type UiohookMouseEvent,
  type UiohookWheelEvent,
} from 'uiohook-napi';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { getKeyFromCode, qHotkeys, qKeys } from './hotkeys';

type HookEvent = 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'wheel';
type HookPayload = UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent;
type HookHandler = (event: HookPayload) => void;

vi.mock('uiohook-napi', () => ({
  uIOhook: {
    on: vi.fn(),
    removeListener: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
}));

const handlers = new Map<HookEvent, HookHandler>();
const mockedUiohook = uIOhook as unknown as {
  on: Mock<(event: HookEvent, handler: HookHandler) => void>;
  removeListener: Mock<(event: HookEvent, handler: HookHandler) => void>;
  start: Mock<() => void>;
  stop: Mock<() => void>;
};

const emitKeydown = (keycode: number): void => {
  handlers.get('keydown')?.({ keycode } as UiohookKeyboardEvent);
};

const emitKeyup = (keycode: number): void => {
  handlers.get('keyup')?.({ keycode } as UiohookKeyboardEvent);
};

const emitMousedown = (button: number): void => {
  handlers.get('mousedown')?.({ button } as UiohookMouseEvent);
};

const emitMouseup = (button: number): void => {
  handlers.get('mouseup')?.({ button } as UiohookMouseEvent);
};

const emitWheel = (rotation: number): void => {
  handlers.get('wheel')?.({ rotation } as UiohookWheelEvent);
};

beforeEach(() => {
  handlers.clear();
  vi.clearAllMocks();

  mockedUiohook.on.mockImplementation((event, handler) => {
    handlers.set(event, handler);
  });

  mockedUiohook.removeListener.mockImplementation((event, handler) => {
    if (handlers.get(event) === handler) {
      handlers.delete(event);
    }
  });
});

describe('getKeyFromCode', () => {
  it('returns a key name for a known qKeys code', () => {
    expect(getKeyFromCode(qKeys.A)).toBe('A');
  });

  it('returns a mouse button name for a known qKeys code', () => {
    expect(getKeyFromCode(qKeys.MouseButton4)).toBe('MouseButton4');
  });

  it('returns undefined for an unknown code', () => {
    expect(getKeyFromCode(0xffff)).toBeUndefined();
  });
});

describe('qHotkeys', () => {
  it('registers and removes uIOhook listeners when started and stopped', () => {
    const hotkeys = new qHotkeys();

    hotkeys.run();

    expect(mockedUiohook.on).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(mockedUiohook.on).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(mockedUiohook.on).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockedUiohook.on).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(mockedUiohook.on).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(mockedUiohook.start).toHaveBeenCalledOnce();

    hotkeys.stop();

    expect(mockedUiohook.removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(mockedUiohook.removeListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(mockedUiohook.removeListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockedUiohook.removeListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(mockedUiohook.removeListener).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(mockedUiohook.stop).toHaveBeenCalledOnce();
    expect(handlers.size).toBe(0);
  });

  it('runs an action when a mouse button hotkey matches exactly', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.MouseButton4], onPress: action });
    hotkeys.run();

    emitMousedown(3);

    expect(action).not.toHaveBeenCalled();

    emitMouseup(3);
    emitMousedown(4);

    expect(action).toHaveBeenCalledOnce();
  });

  it('runs an action for keyboard and mouse button combinations', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.Ctrl, qKeys.MouseButton5], onPress: action });
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitMousedown(5);

    expect(action).toHaveBeenCalledOnce();
  });

  it('runs onRelease in hold mode when a mouse button is released', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.Alt, qKeys.MouseButton2],
      mode: 'hold',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.Alt);
    emitMousedown(2);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();

    emitMouseup(2);

    expect(onRelease).toHaveBeenCalledOnce();
  });

  it('ignores mouse buttons outside the supported 1-5 range', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.MouseButton1], onPress: action });
    hotkeys.run();

    emitMousedown(0);
    emitMousedown(6);

    expect(action).not.toHaveBeenCalled();
  });

  it('runs an action only when the pressed keys exactly match the registered hotkey', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.Ctrl, qKeys.A], onPress: action });
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitKeydown(qKeys.Shift);
    emitKeydown(qKeys.A);

    expect(action).not.toHaveBeenCalled();

    emitKeyup(qKeys.Shift);
    emitKeyup(qKeys.A);
    emitKeydown(qKeys.A);

    expect(action).toHaveBeenCalledOnce();
  });

  it('can register a test hotkey that logs ping', () => {
    const hotkeys = new qHotkeys();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    try {
      hotkeys.register({
        keys: [qKeys.Ctrl, qKeys.Shift, qKeys.P],
        onPress: () => console.log('ping'),
      });
      hotkeys.run();

      emitKeydown(qKeys.Ctrl);
      emitKeydown(qKeys.Shift);

      expect(consoleLog).not.toHaveBeenCalledWith('ping');

      emitKeydown(qKeys.P);

      expect(consoleLog).toHaveBeenCalledWith('ping');
      expect(consoleLog).toHaveBeenCalledOnce();
    } finally {
      consoleLog.mockRestore();
    }
  });

  it('runs onPress and onRelease in hold mode', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.Ctrl, qKeys.Shift],
      mode: 'hold',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitKeydown(qKeys.Shift);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();

    emitKeyup(qKeys.Shift);

    expect(onRelease).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('ignores synthetic key presses while a hold hotkey is active', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();
    const otherAction = vi.fn();

    hotkeys.register({
      keys: [qKeys.Ctrl, qKeys.Shift, qKeys.H],
      mode: 'hold',
      onPress,
      onRelease,
    });
    hotkeys.register({
      keys: [qKeys.Ctrl, qKeys.Shift, qKeys.W],
      onPress: otherAction,
    });
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitKeydown(qKeys.Shift);
    emitKeydown(qKeys.H);

    expect(onPress).toHaveBeenCalledOnce();

    emitKeydown(qKeys.W);
    emitKeyup(qKeys.W);

    expect(otherAction).not.toHaveBeenCalled();
    expect(onRelease).not.toHaveBeenCalled();

    emitKeyup(qKeys.H);

    expect(onRelease).toHaveBeenCalledOnce();
  });

  it('does not call onPress again while a hold hotkey stays active', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.A],
      mode: 'hold',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.A);
    emitKeydown(qKeys.A);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();
  });

  it('toggles on and off with onPress and onRelease', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.Alt, qKeys.E],
      mode: 'toggle',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.Alt);
    emitKeydown(qKeys.E);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();

    emitKeyup(qKeys.E);
    emitKeydown(qKeys.E);

    expect(onRelease).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('can toggle again while automation keys are being pressed', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.Alt, qKeys.E],
      mode: 'toggle',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.Alt);
    emitKeydown(qKeys.E);

    expect(onPress).toHaveBeenCalledOnce();

    emitKeydown(qKeys.A);
    emitKeyup(qKeys.A);
    emitKeydown(qKeys.A);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();

    emitKeyup(qKeys.E);
    emitKeydown(qKeys.E);

    expect(onRelease).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('does not use onRelease in press mode', () => {
    const hotkeys = new qHotkeys();
    const onPress = vi.fn();
    const onRelease = vi.fn();

    hotkeys.register({
      keys: [qKeys.A],
      mode: 'press',
      onPress,
      onRelease,
    });
    hotkeys.run();

    emitKeydown(qKeys.A);
    emitKeyup(qKeys.A);

    expect(onPress).toHaveBeenCalledOnce();
    expect(onRelease).not.toHaveBeenCalled();
  });

  it('ignores repeated keydown events until the key is released', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.A], onPress: action });
    hotkeys.run();

    emitKeydown(qKeys.A);
    emitKeydown(qKeys.A);

    expect(action).toHaveBeenCalledOnce();

    emitKeyup(qKeys.A);
    emitKeydown(qKeys.A);

    expect(action).toHaveBeenCalledTimes(2);
  });

  it('unregisters keyboard hotkeys by key set regardless of order', () => {
    const hotkeys = new qHotkeys();
    const action = vi.fn();

    hotkeys.register({ keys: [qKeys.Ctrl, qKeys.A], onPress: action });
    hotkeys.unregister([qKeys.A, qKeys.Ctrl]);
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitKeydown(qKeys.A);

    expect(action).not.toHaveBeenCalled();
  });

  it('clears keyboard hotkeys without clearing scroll hotkeys by default', () => {
    const hotkeys = new qHotkeys();
    const keyAction = vi.fn();
    const scrollUpAction = vi.fn();
    const scrollDownAction = vi.fn();

    hotkeys.register({ keys: [qKeys.A], onPress: keyAction });
    hotkeys.registerScroll([], scrollUpAction, scrollDownAction);
    hotkeys.unregisterAll();
    hotkeys.run();

    emitKeydown(qKeys.A);
    emitWheel(-1);

    expect(keyAction).not.toHaveBeenCalled();
    expect(scrollUpAction).toHaveBeenCalledOnce();
    expect(scrollDownAction).not.toHaveBeenCalled();
  });

  it('runs scroll actions for matching hotkeys and wheel direction', () => {
    const hotkeys = new qHotkeys();
    const scrollUpAction = vi.fn();
    const scrollDownAction = vi.fn();

    hotkeys.registerScroll([qKeys.Ctrl], scrollUpAction, scrollDownAction);
    hotkeys.run();

    emitWheel(-1);

    expect(scrollUpAction).not.toHaveBeenCalled();
    expect(scrollDownAction).not.toHaveBeenCalled();

    emitKeydown(qKeys.Ctrl);
    emitWheel(-1);
    emitWheel(1);

    expect(scrollUpAction).toHaveBeenCalledOnce();
    expect(scrollDownAction).toHaveBeenCalledOnce();
  });

  it('can unregister individual scroll hotkeys and clear all scroll hotkeys', () => {
    const hotkeys = new qHotkeys();
    const firstUpAction = vi.fn();
    const firstDownAction = vi.fn();
    const secondUpAction = vi.fn();
    const secondDownAction = vi.fn();

    hotkeys.registerScroll([qKeys.Ctrl], firstUpAction, firstDownAction);
    hotkeys.registerScroll([qKeys.Alt], secondUpAction, secondDownAction);
    hotkeys.unregisterScroll([qKeys.Ctrl]);
    hotkeys.run();

    emitKeydown(qKeys.Ctrl);
    emitWheel(-1);

    expect(firstUpAction).not.toHaveBeenCalled();
    expect(firstDownAction).not.toHaveBeenCalled();

    emitKeyup(qKeys.Ctrl);
    emitKeydown(qKeys.Alt);
    emitWheel(1);

    expect(secondUpAction).not.toHaveBeenCalled();
    expect(secondDownAction).toHaveBeenCalledOnce();

    hotkeys.unregisterAll(true);
    emitWheel(1);

    expect(secondDownAction).toHaveBeenCalledOnce();
  });
});
