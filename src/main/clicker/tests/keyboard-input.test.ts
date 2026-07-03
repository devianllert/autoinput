import { describe, expect, it } from 'vitest';

import { SUPPORTED_CLICKER_INPUT_CODES } from '@/shared/clicker/input';
import { isMouseButtonCode, qKeys } from '@/shared/hotkeys/keys';

import { uiohookCodeToEnigoKey } from '../../lib/automation/keyboard-input';

describe('uiohookCodeToEnigoKey', () => {
  it('maps letters, digits, modifiers, and mouse-excluded keys', () => {
    expect(uiohookCodeToEnigoKey(qKeys.A)).toBe('a');
    expect(uiohookCodeToEnigoKey(qKeys['5'])).toBe('5');
    expect(uiohookCodeToEnigoKey(qKeys.Ctrl)).toBe('control');
    expect(uiohookCodeToEnigoKey(qKeys.F5)).toBe('f5');
    expect(uiohookCodeToEnigoKey(qKeys.Space)).toBe('space');
  });

  it('returns undefined for unsupported keys', () => {
    expect(uiohookCodeToEnigoKey(qKeys.Semicolon)).toBeUndefined();
    expect(uiohookCodeToEnigoKey(qKeys.MouseButton1)).toBeUndefined();
    expect(uiohookCodeToEnigoKey(qKeys.F24)).toBeUndefined();
  });

  it('maps every supported non-mouse clicker input', () => {
    const supportedKeyboardCodes = SUPPORTED_CLICKER_INPUT_CODES.filter(
      (code) => !isMouseButtonCode(code),
    );

    for (const code of supportedKeyboardCodes) {
      expect(uiohookCodeToEnigoKey(code)).toBeDefined();
    }
  });
});
