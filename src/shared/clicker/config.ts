import { qKeys, sortInputKeys } from '@/shared/hotkeys/keys';

import { isSupportedClickerInputCode } from './input';
import type { ClickerConfig } from './types';

export const DEFAULT_CLICKER_CONFIG: ClickerConfig = {
  keys: [qKeys.MouseButton1],
  mode: 'press',
};

export const sanitizeClickerConfig = (config: Partial<ClickerConfig>): ClickerConfig => {
  const keys = sortInputKeys([
    ...new Set(
      (config.keys ?? DEFAULT_CLICKER_CONFIG.keys).filter((key) =>
        isSupportedClickerInputCode(key),
      ),
    ),
  ]);

  return {
    keys: keys.length > 0 ? keys : DEFAULT_CLICKER_CONFIG.keys,
    mode: config.mode === 'hold' ? 'hold' : 'press',
  };
};
