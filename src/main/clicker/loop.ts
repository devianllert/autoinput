/** Blur-style batch size: fewer timer wakeups without bunching too many native calls. */
export const getBatchSize = (cps: number): number => {
  if (cps >= 50) {
    return 2;
  }

  return 1;
};

export const getBatchDelayMs = (intervalMs: number, batchSize: number): number =>
  intervalMs * batchSize;

/** Sleep only the remaining time until the batch deadline (0 if already behind). */
export const getSleepUntilDeadlineMs = (deadlineMs: number, nowMs: number): number =>
  Math.max(0, deadlineMs - nowMs);
