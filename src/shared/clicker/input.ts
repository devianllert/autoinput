import { qKeys } from '@/shared/hotkeys/keys';

const SUPPORTED_MOUSE_INPUT_CODES = [qKeys.MouseButton1, qKeys.MouseButton2, qKeys.MouseButton3];

const SUPPORTED_BASE_KEYBOARD_INPUT_CODES = [
  qKeys.Backspace,
  qKeys.Tab,
  qKeys.Enter,
  qKeys.CapsLock,
  qKeys.Escape,
  qKeys.Space,
  qKeys.PageUp,
  qKeys.PageDown,
  qKeys.End,
  qKeys.Home,
  qKeys.ArrowLeft,
  qKeys.ArrowUp,
  qKeys.ArrowRight,
  qKeys.ArrowDown,
  qKeys.Delete,
  qKeys.Ctrl,
  qKeys.CtrlRight,
  qKeys.Alt,
  qKeys.AltRight,
  qKeys.Shift,
  qKeys.ShiftRight,
  qKeys.Meta,
  qKeys.MetaRight,
  qKeys.Cmd,
  qKeys.CmdOrCtrl,
  qKeys.NumpadEnd,
  qKeys.NumpadArrowDown,
  qKeys.NumpadPageDown,
  qKeys.NumpadArrowLeft,
  qKeys.NumpadArrowRight,
  qKeys.NumpadHome,
  qKeys.NumpadArrowUp,
  qKeys.NumpadPageUp,
  qKeys.NumpadDelete,
];

const LETTER_INPUT_CODES = [
  qKeys.A,
  qKeys.B,
  qKeys.C,
  qKeys.D,
  qKeys.E,
  qKeys.F,
  qKeys.G,
  qKeys.H,
  qKeys.I,
  qKeys.J,
  qKeys.K,
  qKeys.L,
  qKeys.M,
  qKeys.N,
  qKeys.O,
  qKeys.P,
  qKeys.Q,
  qKeys.R,
  qKeys.S,
  qKeys.T,
  qKeys.U,
  qKeys.V,
  qKeys.W,
  qKeys.X,
  qKeys.Y,
  qKeys.Z,
];

const DIGIT_INPUT_CODES = [
  qKeys[0],
  qKeys[1],
  qKeys[2],
  qKeys[3],
  qKeys[4],
  qKeys[5],
  qKeys[6],
  qKeys[7],
  qKeys[8],
  qKeys[9],
];

const NUMPAD_DIGIT_INPUT_CODES = [
  qKeys.Numpad0,
  qKeys.Numpad1,
  qKeys.Numpad2,
  qKeys.Numpad3,
  qKeys.Numpad4,
  qKeys.Numpad5,
  qKeys.Numpad6,
  qKeys.Numpad7,
  qKeys.Numpad8,
  qKeys.Numpad9,
];

const FUNCTION_INPUT_CODES = [
  qKeys.F1,
  qKeys.F2,
  qKeys.F3,
  qKeys.F4,
  qKeys.F5,
  qKeys.F6,
  qKeys.F7,
  qKeys.F8,
  qKeys.F9,
  qKeys.F10,
  qKeys.F11,
  qKeys.F12,
  qKeys.F13,
  qKeys.F14,
  qKeys.F15,
  qKeys.F16,
  qKeys.F17,
  qKeys.F18,
  qKeys.F19,
  qKeys.F20,
];

export const SUPPORTED_CLICKER_INPUT_CODES = [
  ...SUPPORTED_MOUSE_INPUT_CODES,
  ...SUPPORTED_BASE_KEYBOARD_INPUT_CODES,
  ...LETTER_INPUT_CODES,
  ...DIGIT_INPUT_CODES,
  ...NUMPAD_DIGIT_INPUT_CODES,
  ...FUNCTION_INPUT_CODES,
];

const SUPPORTED_CLICKER_INPUT_CODE_SET = new Set<number>(SUPPORTED_CLICKER_INPUT_CODES);

export const isSupportedClickerInputCode = (code: number): boolean =>
  SUPPORTED_CLICKER_INPUT_CODE_SET.has(code);
