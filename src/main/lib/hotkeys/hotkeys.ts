import { uIOhook, UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi';

import { getKeyFromCode } from '@/shared/hotkeys/keys';

export { formatHotkeyKeys, getKeyFromCode, qKeys } from '@/shared/hotkeys/keys';

type action = () => void;

/**
 * Hotkey trigger mode.
 *
 * - `press` — calls `onPress` once on an exact key combination match.
 * - `hold` — calls `onPress` while held and `onRelease` when any combo key is released.
 * - `toggle` — first press enables (`onPress`), second press disables (`onRelease`).
 */
export type HotkeyMode = 'press' | 'hold' | 'toggle';

/** Keyboard hotkey registration options. */
export type HotkeyRegistration = {
  /** Key codes for the combination. Use values from {@link qKeys}. */
  keys: number[];
  /** Callback on press or when a hold/toggle hotkey is activated. */
  onPress: action;
  /** Trigger mode. Defaults to `press`. */
  mode?: HotkeyMode;
  /** Callback on release. Only used in `hold` and `toggle` modes. */
  onRelease?: action;
};

/** Internal hotkey state stored in the registry. */
type HotkeyEntry = {
  keys: number[];
  mode: HotkeyMode;
  onPress: action;
  onRelease?: action;
  /** Whether the hotkey is currently active (`hold` or enabled `toggle`). */
  active: boolean;
};

// export type qKeyMap = {
//   [key_name: string | number]: number
// }

/** Maps a uiohook mouse button (1–5) to a {@link qKeys} code, or `undefined` if unsupported. */
export const mouseButtonToCode = (button: number): number | undefined => {
  if (button < 1 || button > 5) return undefined;

  return 0xff00 | button;
};

/**
 * Global keyboard and scroll hotkey handler powered by `uiohook-napi`.
 *
 * ## How it works
 *
 * 1. Listens to `keydown`, `keyup`, `mousedown`, `mouseup`, and `wheel` via `uIOhook`.
 * 2. Tracks currently pressed keys in `keys_pressed`.
 * 3. On `keydown`, searches registered hotkeys for a match.
 * 4. Longer combinations take priority over shorter ones.
 *
 * ## Matching
 *
 * - `press` and the initial trigger for `hold`/`toggle` require an **exact match**:
 *   pressed keys must equal the hotkey combination exactly.
 * - Re-disabling an active `toggle` can also match when all combo keys are pressed,
 *   even if extra keys are present in the internal state.
 *
 * ## Active hotkey isolation
 *
 * While a `hold` hotkey is active or a `toggle` hotkey is enabled, unrelated key
 * events (for example from automation) are ignored. Only keys from the current
 * combination are processed, which prevents synthetic input from breaking state.
 *
 * @example
 * ```ts
 * const hotkeys = new qHotkeys();
 *
 * hotkeys.register({
 *   keys: [qKeys.Ctrl, qKeys.Shift, qKeys.P],
 *   onPress: () => console.log('ping'),
 * });
 *
 * hotkeys.register({
 *   keys: [qKeys.Alt, qKeys.E],
 *   mode: 'toggle',
 *   onPress: () => startWorker(),
 *   onRelease: () => stopWorker(),
 * });
 *
 * hotkeys.run();
 * ```
 */
export class Hotkeys {
  /** Currently pressed keycodes in the order they were pressed. */
  private keys_pressed: number[] = [];
  /** Registered keyboard hotkeys keyed by their key combination. */
  private hotkey_map: Map<number[], HotkeyEntry> = new Map();
  /** Registered scroll hotkeys keyed by required modifier keys. */
  private scroll_hotkey_map: Map<number[], action[]> = new Map();
  /** Enables verbose event logging in the console. */
  private debug: boolean = false;

  /**
   * Registers a keyboard hotkey.
   * Registering the same combination again overwrites the previous entry.
   */
  public register = ({ keys, onPress, mode = 'press', onRelease }: HotkeyRegistration): void => {
    if (!keys) {
      console.log(`Error: Hotkey map empty for '${onPress}'`);
      return;
    }

    this.hotkey_map.set(keys, {
      keys,
      mode,
      onPress,
      onRelease: mode === 'hold' || mode === 'toggle' ? onRelease : undefined,
      active: false,
    });
  };

  /**
   * Removes all keyboard hotkeys.
   * @param scroll - When `true`, also clears scroll hotkeys.
   */
  public unregisterAll = (scroll = false): void => {
    this.hotkey_map.clear();
    if (this.debug) console.log('Unregistered all hotkeys');
    if (scroll) {
      this.scroll_hotkey_map.clear();
      if (this.debug) console.log('Unregistered all scroll hotkeys');
    }
  };

  /** Removes a hotkey by key set. Key order in the array does not matter. */
  public unregister = (keys: number[]): void => {
    this.hotkey_map.forEach((_, hotkeys: number[]) => {
      if (hotkeys.every((key) => keys.includes(key)) && hotkeys.length == keys.length) {
        if (this.debug) console.log(`Unregistered: ${hotkeys.join(' + ')}`);
        this.hotkey_map.delete(hotkeys);
      }
    });
  };

  /**
   * Registers a scroll hotkey.
   * @param keys - Modifier keys that must be held. An empty array means no modifiers.
   * @param upAction - Callback for scroll up.
   * @param downAction - Callback for scroll down.
   */
  public registerScroll = (keys: number[], upAction: () => void, downAction: () => void): void => {
    this.scroll_hotkey_map.set(keys, [upAction, downAction]);
  };

  /** Removes a scroll hotkey by its modifier key set. */
  public unregisterScroll = (keys: number[]): void => {
    this.scroll_hotkey_map.forEach((_, hotkeys: number[]) => {
      if (hotkeys.every((key) => keys.includes(key)) && hotkeys.length == keys.length) {
        if (this.debug) console.log(`Unregistered: ${hotkeys.join(' + ')}`);
        this.scroll_hotkey_map.delete(hotkeys);
      }
    });
  };

  /**
   * Subscribes to `uIOhook` events and starts the global hook.
   * @param debug - Enables verbose logging for incoming events.
   */
  public run = (debug = false): void => {
    this.debug = debug;
    uIOhook.on('keydown', this._handleKeydown);
    uIOhook.on('keyup', this._handleKeyup);
    uIOhook.on('mousedown', this._handleMousedown);
    uIOhook.on('mouseup', this._handleMouseup);
    uIOhook.on('wheel', this._handleWheel);
    uIOhook.start();
  };

  /**
   * Handles `keydown` events.
   * Updates pressed-key state, applies active-hotkey isolation, and dispatches matches.
   */
  private _handleKeydown = (event: UiohookKeyboardEvent): void => {
    this._handlePress(event.keycode);
  };

  /**
   * Handles `keyup` events.
   * Updates pressed-key state and releases active `hold` hotkeys when needed.
   */
  private _handleKeyup = (event: UiohookKeyboardEvent): void => {
    this._handleRelease(event.keycode);
  };

  /** Handles `mousedown` events for mouse buttons 1–5. */
  private _handleMousedown = (event: UiohookMouseEvent): void => {
    const code = mouseButtonToCode(event.button as number);
    if (code === undefined) return;

    this._handlePress(code);
  };

  /** Handles `mouseup` events for mouse buttons 1–5. */
  private _handleMouseup = (event: UiohookMouseEvent): void => {
    const code = mouseButtonToCode(event.button as number);
    if (code === undefined) return;

    this._handleRelease(code);
  };

  /**
   * Updates pressed-key state on press, applies active-hotkey isolation, and dispatches matches.
   */
  private _handlePress = (key: number): void => {
    if (this.keys_pressed.includes(key)) return;

    if (this._hasActiveLockedHotkey() && !this._isActiveLockedComboKey(key)) {
      if (this.debug) console.log(`Ignored keydown during active hotkey: ${getKeyFromCode(key)}`);
      return;
    }

    this.keys_pressed.push(key);

    if (this.debug) console.log(`Pressed: ${getKeyFromCode(key)}`);

    const matchedHotkey = this._findMatchedHotkey(key);
    if (!matchedHotkey) return;

    if (matchedHotkey.mode === 'hold') {
      this._activateHoldHotkey(matchedHotkey);
      return;
    }

    if (matchedHotkey.mode === 'toggle') {
      this._toggleHotkey(matchedHotkey);
      return;
    }

    if (this.debug) console.log(`Hotkey Map Pressed: ${matchedHotkey.keys}`);
    matchedHotkey.onPress();
  };

  /** Updates pressed-key state on release and releases active `hold` hotkeys when needed. */
  private _handleRelease = (key: number): void => {
    if (this._hasActiveLockedHotkey() && !this._isActiveLockedComboKey(key)) {
      if (this.debug) console.log(`Ignored keyup during active hotkey: ${getKeyFromCode(key)}`);
      return;
    }

    const holdHotkeysToRelease = this._getActiveHoldHotkeysForKey(key);
    const i: number = this.keys_pressed.indexOf(key);
    if (i != -1) this.keys_pressed.splice(i, 1);
    if (this.debug) console.log(`Let Go: ${getKeyFromCode(key)}`);

    holdHotkeysToRelease.forEach(this._releaseHoldHotkey);
  };

  /** Returns registered hotkeys sorted by combination length, longest first. */
  private _getSortedHotkeys = (): HotkeyEntry[] => {
    return Array.from(this.hotkey_map.values()).sort((a, b) => b.keys.length - a.keys.length);
  };

  /** Checks whether pressed keys exactly match the given combination. */
  private _isExactMatch = (hotkeys: number[]): boolean => {
    return (
      hotkeys.length === this.keys_pressed.length &&
      hotkeys.every((key) => this.keys_pressed.includes(key))
    );
  };

  /**
   * Checks whether a hotkey can trigger even when extra keys are present.
   * Used to re-toggle an active `toggle` hotkey by pressing one of its combo keys again.
   */
  private _canTriggerWithExtraKeys = (hotkey: HotkeyEntry, pressedKey: number): boolean => {
    return (
      hotkey.keys.includes(pressedKey) &&
      hotkey.keys.every((key) => this.keys_pressed.includes(key))
    );
  };

  /**
   * Finds the hotkey that should trigger for the current key press.
   * Active `toggle` hotkeys are checked first, then exact matches.
   */
  private _findMatchedHotkey = (pressedKey: number): HotkeyEntry | undefined => {
    const sortedHotkeys = this._getSortedHotkeys();

    const activeToggle = sortedHotkeys.find(
      (hotkey) =>
        hotkey.mode === 'toggle' &&
        hotkey.active &&
        this._canTriggerWithExtraKeys(hotkey, pressedKey),
    );
    if (activeToggle) return activeToggle;

    return sortedHotkeys.find((hotkey) => this._isExactMatch(hotkey.keys));
  };

  /** Returns all currently active `hold` hotkeys. */
  private _getActiveHoldHotkeys = (): HotkeyEntry[] => {
    return this._getSortedHotkeys().filter((hotkey) => hotkey.mode === 'hold' && hotkey.active);
  };

  /** Returns active hotkeys that lock input to their own combination (`hold` and enabled `toggle`). */
  private _getActiveLockedHotkeys = (): HotkeyEntry[] => {
    return this._getSortedHotkeys().filter(
      (hotkey) => (hotkey.mode === 'hold' || hotkey.mode === 'toggle') && hotkey.active,
    );
  };

  /** Returns whether any hotkey currently isolates unrelated key events. */
  private _hasActiveLockedHotkey = (): boolean => {
    return this._getActiveLockedHotkeys().length > 0;
  };

  /** Returns whether a key belongs to any currently locked hotkey combination. */
  private _isActiveLockedComboKey = (key: number): boolean => {
    return this._getActiveLockedHotkeys().some((hotkey) => hotkey.keys.includes(key));
  };

  /** Returns active `hold` hotkeys that include the released key. */
  /** Returns active `hold` hotkeys that include the released key. */
  private _getActiveHoldHotkeysForKey = (key: number): HotkeyEntry[] => {
    return this._getActiveHoldHotkeys().filter((hotkey) => hotkey.keys.includes(key));
  };

  /** Activates a `hold` hotkey and runs `onPress` once. */
  private _activateHoldHotkey = (hotkey: HotkeyEntry): void => {
    if (hotkey.active) return;

    hotkey.active = true;
    if (this.debug) console.log(`Hotkey Hold Started: ${hotkey.keys}`);
    hotkey.onPress();
  };

  /** Deactivates a `hold` hotkey and runs `onRelease`. */
  private _releaseHoldHotkey = (hotkey: HotkeyEntry): void => {
    if (!hotkey.active) return;

    hotkey.active = false;
    if (this.debug) console.log(`Hotkey Hold Ended: ${hotkey.keys}`);
    hotkey.onRelease?.();
  };

  /** Toggles a `toggle` hotkey and runs `onPress` or `onRelease`. */
  private _toggleHotkey = (hotkey: HotkeyEntry): void => {
    hotkey.active = !hotkey.active;

    if (this.debug) {
      console.log(`Hotkey Toggle ${hotkey.active ? 'Started' : 'Ended'}: ${hotkey.keys}`);
    }

    const action = hotkey.active ? hotkey.onPress : hotkey.onRelease;
    action?.();
  };

  /** Handles `wheel` events and dispatches matching scroll hotkeys. */
  private _handleWheel = (event: UiohookWheelEvent): void => {
    if (this.scroll_hotkey_map.size == 0) return;
    const direction = event.rotation === 1 ? 'DOWN' : 'UP';

    if (this.debug) console.log(`Scrolled ${direction}`);
    this.scroll_hotkey_map.forEach((actions, hotkeys: number[]) => {
      if (hotkeys.length == 0 || hotkeys.every((key) => this.keys_pressed.includes(key))) {
        if (direction === 'UP') actions[0]();
        if (direction === 'DOWN') actions[1]();
      }
    });
  };

  /** Unsubscribes from `uIOhook` events and stops the global hook. */
  public stop = (): void => {
    uIOhook.removeListener('keydown', this._handleKeydown);
    uIOhook.removeListener('keyup', this._handleKeyup);
    uIOhook.removeListener('mousedown', this._handleMousedown);
    uIOhook.removeListener('mouseup', this._handleMouseup);
    uIOhook.removeListener('wheel', this._handleWheel);
    uIOhook.stop();
  };
}
