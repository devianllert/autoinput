import { tipc } from '@egoist/tipc/main';

import type { WindowTargetConfig } from '@/shared/window-target/types';

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
import { listWindowTargets } from '../../lib/window-target/windows';

const t = tipc.create();

export const clickerRouter = {
  getClickerConfig: t.procedure.action(async () => {
    return Promise.resolve(getClickerConfig());
  }),
  updateClickerConfig: t.procedure.input<ClickerConfig>().action(async ({ input }) => {
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
