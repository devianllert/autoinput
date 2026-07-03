import { keyDown, keyUp, type KeyboardKey } from '@dvnllrt/enigo-napi-rs';

import { qKeys } from '@/shared/hotkeys/keys';

const UIOHOOK_TO_ENIGO_KEY = new Map<number, KeyboardKey>([
  [qKeys.Backspace, 'backspace'],
  [qKeys.Tab, 'tab'],
  [qKeys.Enter, 'enter'],
  [qKeys.CapsLock, 'capsLock'],
  [qKeys.Escape, 'escape'],
  [qKeys.Space, 'space'],
  [qKeys.PageUp, 'pageUp'],
  [qKeys.PageDown, 'pageDown'],
  [qKeys.End, 'end'],
  [qKeys.Home, 'home'],
  [qKeys.ArrowLeft, 'left'],
  [qKeys.ArrowUp, 'up'],
  [qKeys.ArrowRight, 'right'],
  [qKeys.ArrowDown, 'down'],
  [qKeys.Delete, 'delete'],
  [qKeys.Ctrl, 'control'],
  [qKeys.CtrlRight, 'rcontrol'],
  [qKeys.Alt, 'alt'],
  [qKeys.AltRight, 'ralt'],
  [qKeys.Shift, 'shift'],
  [qKeys.ShiftRight, 'rshift'],
  [qKeys.Meta, 'meta'],
  [qKeys.MetaRight, 'rmeta'],
  [qKeys.Cmd, 'meta'],
  [qKeys.Numpad0, 'numpad0'],
  [qKeys.Numpad1, 'numpad1'],
  [qKeys.Numpad2, 'numpad2'],
  [qKeys.Numpad3, 'numpad3'],
  [qKeys.Numpad4, 'numpad4'],
  [qKeys.Numpad5, 'numpad5'],
  [qKeys.Numpad6, 'numpad6'],
  [qKeys.Numpad7, 'numpad7'],
  [qKeys.Numpad8, 'numpad8'],
  [qKeys.Numpad9, 'numpad9'],
  [qKeys.NumpadEnd, 'end'],
  [qKeys.NumpadArrowDown, 'down'],
  [qKeys.NumpadPageDown, 'pageDown'],
  [qKeys.NumpadArrowLeft, 'left'],
  [qKeys.NumpadArrowRight, 'right'],
  [qKeys.NumpadHome, 'home'],
  [qKeys.NumpadArrowUp, 'up'],
  [qKeys.NumpadPageUp, 'pageUp'],
  [qKeys.NumpadDelete, 'delete'],
]);

const LETTER_KEYS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const satisfies ReadonlyArray<keyof typeof qKeys>;

for (const letterKey of LETTER_KEYS) {
  UIOHOOK_TO_ENIGO_KEY.set(qKeys[letterKey], letterKey.toLowerCase() as KeyboardKey);
}

const DIGIT_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies ReadonlyArray<
  keyof typeof qKeys
>;

for (const digitKey of DIGIT_KEYS) {
  UIOHOOK_TO_ENIGO_KEY.set(qKeys[digitKey], String(digitKey) as KeyboardKey);
}

for (let index = 1; index <= 20; index++) {
  const fnKey = `F${index}` as keyof typeof qKeys;

  UIOHOOK_TO_ENIGO_KEY.set(qKeys[fnKey], `f${index}` as KeyboardKey);
}

if (process.platform === 'darwin') {
  UIOHOOK_TO_ENIGO_KEY.set(qKeys.CmdOrCtrl, 'meta');
} else {
  UIOHOOK_TO_ENIGO_KEY.set(qKeys.CmdOrCtrl, 'control');
}

export const uiohookCodeToEnigoKey = (code: number): KeyboardKey | undefined =>
  UIOHOOK_TO_ENIGO_KEY.get(code);

export const keyboardDown = (code: number): void => {
  const key = uiohookCodeToEnigoKey(code);

  if (key) {
    keyDown(key);
  }
};

export const keyboardUp = (code: number): void => {
  const key = uiohookCodeToEnigoKey(code);

  if (key) {
    keyUp(key);
  }
};
