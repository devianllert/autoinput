import type { ClickerInputMode } from '@/shared/clicker/types';

import { HoldClicker } from './hold-clicker';
import { PressClicker } from './press-clicker';
import type { Clicker } from './types';

export type { Clicker } from './types';

export const createClicker = (mode: ClickerInputMode): Clicker => {
  if (mode === 'hold') {
    return new HoldClicker();
  }

  return new PressClicker();
};
