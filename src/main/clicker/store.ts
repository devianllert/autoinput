import { Conf } from 'electron-conf';

import { DEFAULT_CLICKER_CONFIG, sanitizeClickerConfig } from '@/shared/clicker/config';
import { clampCps } from '@/shared/clicker/limits';
import { qKeys } from '@/shared/hotkeys/keys';
import { WindowTargetConfig } from '@/shared/window-target/types';

import { ClickerConfig, ClickerTimingConfig } from './types';

const defaultClickerConfig: ClickerConfig = {
  keys: [qKeys.MouseButton1],
  mode: 'press',
};

const defaultClickerTiming: ClickerTimingConfig = {
  cps: 20,
};

const defaultWindowTargetConfig: WindowTargetConfig = {
  targetId: null,
};

const ClickerStore = new Conf<{
  config: ClickerConfig;
  timing: ClickerTimingConfig;
  windowTarget: WindowTargetConfig;
}>({
  name: 'clicker',
  defaults: {
    config: defaultClickerConfig,
    timing: defaultClickerTiming,
    windowTarget: defaultWindowTargetConfig,
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

export const getWindowTargetConfig = (): WindowTargetConfig => {
  const config = ClickerStore.get('windowTarget', defaultWindowTargetConfig);

  return {
    targetId: config.targetId || null,
  };
};

export const updateWindowTargetConfig = (config: WindowTargetConfig): void => {
  ClickerStore.set('windowTarget', { targetId: config.targetId || null });
};
