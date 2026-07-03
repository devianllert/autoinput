import { Conf } from 'electron-conf';

import { DEFAULT_CLICKER_CONFIG, sanitizeClickerConfig } from '@/shared/clicker/config';
import { clampCps } from '@/shared/clicker/limits';
import { qKeys } from '@/shared/hotkeys/keys';

import { ClickerConfig, ClickerTimingConfig } from './types';

const defaultClickerConfig: ClickerConfig = {
  keys: [qKeys.MouseButton1],
  mode: 'press',
};

const defaultClickerTiming: ClickerTimingConfig = {
  cps: 20,
};

const ClickerStore = new Conf<{
  config: ClickerConfig;
  timing: ClickerTimingConfig;
}>({
  name: 'clicker',
  defaults: {
    config: defaultClickerConfig,
    timing: defaultClickerTiming,
  },
});

export const getClickerConfig = (): ClickerConfig => {
  return sanitizeClickerConfig(ClickerStore.get('config', DEFAULT_CLICKER_CONFIG));
};

export const updateClickerConfig = (config: ClickerConfig): void => {
  ClickerStore.set('config', sanitizeClickerConfig(config));
};

export const getClickerTiming = (): ClickerTimingConfig => {
  const timing = ClickerStore.get('timing', defaultClickerTiming);

  return { cps: clampCps(timing.cps) };
};

export const updateClickerTiming = (timing: ClickerTimingConfig): void => {
  ClickerStore.set('timing', { cps: clampCps(timing.cps) });
};
