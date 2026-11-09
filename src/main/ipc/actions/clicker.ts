import { tipc } from '@egoist/tipc/main';

import { sanitizeClickerConfig } from '@/shared/clicker/config';
import { CLICKER_HOTKEY_NAME } from '@/shared/clicker/key-conflict';
import type { WindowTargetConfig } from '@/shared/window-target/types';

import { assertNoKeyConflict } from '../../clicker/key-conflict';
import {
  getClickerConfig,
  getClickerTiming,
  getWindowTargetConfig,
  updateClickerConfig,
  updateClickerTiming,
  updateWindowTargetConfig,
} from '../../clicker/store';
import { ClickerConfig, ClickerTimingConfig } from '../../clicker/types';
import { autoClicker } from '../../clicker/worker-runner';
import { getHotkeys } from '../../hotkeys/store';
import { listWindowTargets } from '../../lib/window-target/windows';

const t = tipc.create();

export const clickerRouter = {
  getClickerConfig: t.procedure.action(async () => {
    return Promise.resolve(getClickerConfig());
  }),
  updateClickerConfig: t.procedure.input<ClickerConfig>().action(async ({ input }) => {
    const hotkey = getHotkeys().find(({ name }) => name === CLICKER_HOTKEY_NAME);

    if (!hotkey) {
      throw new Error(`Hotkey ${CLICKER_HOTKEY_NAME} not found`);
    }

    assertNoKeyConflict(hotkey.keys, sanitizeClickerConfig(input).keys);
    updateClickerConfig(input);
    return Promise.resolve();
  }),
  getClickerTiming: t.procedure.action(async () => {
    return Promise.resolve(getClickerTiming());
  }),
  updateClickerTiming: t.procedure.input<ClickerTimingConfig>().action(async ({ input }) => {
    updateClickerTiming(input);
    return Promise.resolve();
  }),
  getWindowTargets: t.procedure.action(async () => {
    return Promise.resolve(listWindowTargets());
  }),
  getWindowTargetConfig: t.procedure.action(async () => {
    return Promise.resolve(getWindowTargetConfig());
  }),
  updateWindowTargetConfig: t.procedure.input<WindowTargetConfig>().action(async ({ input }) => {
    updateWindowTargetConfig(input);
    autoClicker.applyWindowTargetConfig(input);
    return Promise.resolve();
  }),
  isClickerRunning: t.procedure.action(async () => {
    return Promise.resolve(autoClicker.isRunning);
  }),
};
