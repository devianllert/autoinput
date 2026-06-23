import { tipc } from '@egoist/tipc/main';

import {
  getClickerConfig,
  getClickerTiming,
  updateClickerConfig,
  updateClickerTiming,
} from '../../clicker/store';
import { ClickerConfig, ClickerTimingConfig } from '../../clicker/types';
import { autoClicker } from '../../clicker/worker-runner';

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
  isClickerRunning: t.procedure.action(async () => {
    return Promise.resolve(autoClicker.isRunning);
  }),
};
