export type RateUnit = 'second' | 'minute' | 'hour';

const SECONDS_PER_UNIT: Record<RateUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
};

const RATE_DECIMALS = 6;

/** Converts clicks per second to clicks per `unit`. */
export const cpsToRate = (cps: number, unit: RateUnit): number => cps * SECONDS_PER_UNIT[unit];

/** Converts clicks per `unit` to clicks per second. */
export const rateToCps = (rate: number, unit: RateUnit): number => rate / SECONDS_PER_UNIT[unit];

/** Formats a rate for an input field, hiding floating-point noise such as 7.000000000000001. */
export const formatRate = (rate: number): string => String(Number(rate.toFixed(RATE_DECIMALS)));
