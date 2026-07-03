import { describe, expect, it } from 'vitest';

import { recordedInputCodesToUiohookCodes } from '../dom';
import { qKeys } from '../keys';

describe('recordedInputCodesToUiohookCodes', () => {
  it('maps recorded keyboard and mouse input codes to uiohook codes', () => {
    expect(
      recordedInputCodesToUiohookCodes([
        { type: 'keyboard', code: 'ControlLeft' },
        { type: 'keyboard', code: 'KeyA' },
        { type: 'mouse', button: 0 },
      ]),
    ).toEqual([qKeys.Ctrl, qKeys.A, qKeys.MouseButton1]);
  });

  it('ignores unknown DOM codes and deduplicates mapped codes', () => {
    expect(
      recordedInputCodesToUiohookCodes([
        { type: 'keyboard', code: 'KeyA' },
        { type: 'keyboard', code: 'KeyA' },
        { type: 'keyboard', code: 'UnknownKey' },
        { type: 'mouse', button: 99 },
      ]),
    ).toEqual([qKeys.A]);
  });
});
