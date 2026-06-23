/** Lowest supported click rate. */
export const MIN_CLICKS_PER_SECOND = 1;

/**
 * Highest useful click rate on Windows.
 *
 * Synthetic input and the default system timer cannot reliably exceed ~500 clicks/s;
 * values above this are clamped because raising CPS further does not increase throughput.
 */
export const MAX_CLICKS_PER_SECOND = 500;

/** Default when stored or entered CPS is missing or not a finite number. */
export const DEFAULT_CLICKS_PER_SECOND = 20;

export const clampCps = (cps: number): number => {
  if (!Number.isFinite(cps)) {
    return DEFAULT_CLICKS_PER_SECOND;
  }

  return Math.max(MIN_CLICKS_PER_SECOND, Math.min(cps, MAX_CLICKS_PER_SECOND));
};
