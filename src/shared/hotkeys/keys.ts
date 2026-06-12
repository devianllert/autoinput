/** Maps key names to uiohook keycodes. */
export const qKeys = {
  Backspace: 0x000e,
  Tab: 0x000f,
  Enter: 0x001c,
  CapsLock: 0x003a,
  Escape: 0x0001,
  Space: 0x0039,
  PageUp: 0x0e49,
  PageDown: 0x0e51,
  End: 0x0e4f,
  Home: 0x0e47,
  ArrowLeft: 0xe04b,
  ArrowUp: 0xe048,
  ArrowRight: 0xe04d,
  ArrowDown: 0xe050,
  Insert: 0x0e52,
  Delete: 0x0e53,
  0: 0x000b,
  1: 0x0002,
  2: 0x0003,
  3: 0x0004,
  4: 0x0005,
  5: 0x0006,
  6: 0x0007,
  7: 0x0008,
  8: 0x0009,
  9: 0x000a,
  A: 0x001e,
  B: 0x0030,
  C: 0x002e,
  D: 0x0020,
  E: 0x0012,
  F: 0x0021,
  G: 0x0022,
  H: 0x0023,
  I: 0x0017,
  J: 0x0024,
  K: 0x0025,
  L: 0x0026,
  M: 0x0032,
  N: 0x0031,
  O: 0x0018,
  P: 0x0019,
  Q: 0x0010,
  R: 0x0013,
  S: 0x001f,
  T: 0x0014,
  U: 0x0016,
  V: 0x002f,
  W: 0x0011,
  X: 0x002d,
  Y: 0x0015,
  Z: 0x002c,
  Numpad0: 0x0052,
  Numpad1: 0x004f,
  Numpad2: 0x0050,
  Numpad3: 0x0051,
  Numpad4: 0x004b,
  Numpad5: 0x004c,
  Numpad6: 0x004d,
  Numpad7: 0x0047,
  Numpad8: 0x0048,
  Numpad9: 0x0049,
  NumpadMultiply: 0x0037,
  NumpadAdd: 0x004e,
  NumpadSubtract: 0x004a,
  NumpadDecimal: 0x0053,
  NumpadDivide: 0x0e35,
  NumpadEnd: 0xee00 | 0x004f,
  NumpadArrowDown: 0xee00 | 0x0050,
  NumpadPageDown: 0xee00 | 0x0051,
  NumpadArrowLeft: 0xee00 | 0x004b,
  NumpadArrowRight: 0xee00 | 0x004d,
  NumpadHome: 0xee00 | 0x0047,
  NumpadArrowUp: 0xee00 | 0x0048,
  NumpadPageUp: 0xee00 | 0x0049,
  NumpadInsert: 0xee00 | 0x0052,
  NumpadDelete: 0xee00 | 0x0053,
  F1: 0x003b,
  F2: 0x003c,
  F3: 0x003d,
  F4: 0x003e,
  F5: 0x003f,
  F6: 0x0040,
  F7: 0x0041,
  F8: 0x0042,
  F9: 0x0043,
  F10: 0x0044,
  F11: 0x0057,
  F12: 0x0058,
  F13: 0x005b,
  F14: 0x005c,
  F15: 0x005d,
  F16: 0x0063,
  F17: 0x0064,
  F18: 0x0065,
  F19: 0x0066,
  F20: 0x0067,
  F21: 0x0068,
  F22: 0x0069,
  F23: 0x006a,
  F24: 0x006b,
  Semicolon: 0x0027,
  Equal: 0x000d,
  Comma: 0x0033,
  Minus: 0x000c,
  Period: 0x0034,
  Slash: 0x0035,
  Backquote: 0x0029,
  BracketLeft: 0x001a,
  Backslash: 0x002b,
  BracketRight: 0x001b,
  Quote: 0x0028,
  Ctrl: 0x001d,
  CtrlRight: 0x0e1d,
  Alt: 0x0038,
  AltRight: 0x0e38,
  Shift: 0x002a,
  ShiftRight: 0x0036,
  Meta: 0x0e5b,
  MetaRight: 0x0e5c,
  NumLock: 0x0045,
  ScrollLock: 0x0046,
  PrintScreen: 0x0e37,
  Pause: 0x0077,
  Cmd: 0x0e5b,
  CmdOrCtrl: typeof process !== 'undefined' && process.platform === 'darwin' ? 0x0e5b : 0x001d,
  MouseButton1: 0xff00 | 1,
  MouseButton2: 0xff00 | 2,
  MouseButton3: 0xff00 | 3,
  MouseButton4: 0xff00 | 4,
  MouseButton5: 0xff00 | 5,
} as const;

const MODIFIER_CODES = new Set<number>([
  qKeys.Ctrl,
  qKeys.CtrlRight,
  qKeys.Shift,
  qKeys.ShiftRight,
  qKeys.Alt,
  qKeys.AltRight,
  qKeys.Meta,
  qKeys.MetaRight,
  qKeys.Cmd,
  qKeys.CmdOrCtrl,
]);

const MODIFIER_SORT_ORDER = new Map<number, number>([
  [qKeys.Ctrl, 0],
  [qKeys.CtrlRight, 1],
  [qKeys.Shift, 2],
  [qKeys.ShiftRight, 3],
  [qKeys.Alt, 4],
  [qKeys.AltRight, 5],
  [qKeys.Meta, 6],
  [qKeys.MetaRight, 7],
]);

const isMac = (): boolean => {
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'darwin';
  }

  return navigator.platform.toUpperCase().includes('MAC');
};

/** Returns a key name for a uiohook keycode, or `undefined` if the code is unknown. */
export const getKeyFromCode = (code: number): string | undefined => {
  return Object.keys(qKeys).find((key) => qKeys[key as keyof typeof qKeys] === code);
};

const getDisplayName = (code: number): string => {
  const name = getKeyFromCode(code);
  if (!name) return `Key ${code.toString(16)}`;

  const metaLabel = isMac() ? 'Cmd' : 'Win';

  const overrides: Record<string, string> = {
    CtrlRight: 'Ctrl',
    ShiftRight: 'Shift',
    AltRight: 'Alt',
    MetaRight: metaLabel,
    Meta: metaLabel,
    Cmd: 'Cmd',
    CmdOrCtrl: isMac() ? 'Cmd' : 'Ctrl',
    MouseButton1: 'Mouse Left',
    MouseButton2: 'Mouse Right',
    MouseButton3: 'Mouse Middle',
    MouseButton4: 'Mouse Back',
    MouseButton5: 'Mouse Forward',
  };

  return overrides[name] ?? name;
};

/** Formats uiohook key codes as a human-readable shortcut, e.g. `Ctrl+Shift+P`. */
export const formatHotkeyKeys = (codes: number[]): string => {
  const modifiers = codes.filter((code) => MODIFIER_CODES.has(code));
  const others = codes.filter((code) => !MODIFIER_CODES.has(code));

  const sorted = [
    ...modifiers.toSorted(
      (a, b) => (MODIFIER_SORT_ORDER.get(a) ?? 99) - (MODIFIER_SORT_ORDER.get(b) ?? 99),
    ),
    ...others,
  ];

  return sorted.map(getDisplayName).join('+');
};
