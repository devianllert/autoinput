import { mouseDown, mouseUp, type MouseButton } from '@dvnllrt/enigo-napi-rs';

import { isMouseButtonCode, qKeys, sortInputKeys } from '@/shared/hotkeys/keys';

import { keyboardDown, keyboardUp } from './keyboard-input';

const MOUSE_BUTTONS = new Map<number, MouseButton>([
  [qKeys.MouseButton1, 'left'],
  [qKeys.MouseButton2, 'right'],
  [qKeys.MouseButton3, 'middle'],
]);

const splitKeys = (keys: number[]) => {
  const sorted = sortInputKeys(keys);
  const mouseKeys = sorted.filter((key) => isMouseButtonCode(key));
  const keyboardKeys = sorted.filter((key) => !isMouseButtonCode(key));

  return { mouseKeys, keyboardKeys };
};

const pressMouseButtons = (keys: number[]): void => {
  for (const key of keys) {
    const button = MOUSE_BUTTONS.get(key);

    if (button) {
      mouseDown(button);
    }
  }
};

const releaseMouseButtons = (keys: number[]): void => {
  for (const key of [...keys].reverse()) {
    const button = MOUSE_BUTTONS.get(key);

    if (button) {
      mouseUp(button);
    }
  }
};

const pressKeyboardKeys = (keys: number[]): void => {
  for (const key of keys) {
    keyboardDown(key);
  }
};

const releaseKeyboardKeys = (keys: number[]): void => {
  for (const key of [...keys].reverse()) {
    keyboardUp(key);
  }
};

export const performInputDown = (keys: number[]): void => {
  const { mouseKeys, keyboardKeys } = splitKeys(keys);

  pressKeyboardKeys(keyboardKeys);
  pressMouseButtons(mouseKeys);
};

export const performInputUp = (keys: number[]): void => {
  const { mouseKeys, keyboardKeys } = splitKeys(keys);

  releaseMouseButtons(mouseKeys);
  releaseKeyboardKeys(keyboardKeys);
};

export const performInputTap = (keys: number[]): void => {
  performInputDown(keys);
  performInputUp(keys);
};
