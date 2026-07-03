import koffi from 'koffi';

/** 1 ms in 100 ns units, as used by NtSetTimerResolution. */
const DESIRED_RESOLUTION_1MS = 10_000;

type NtSetTimerResolutionFn = (
  desiredResolution: number,
  setResolution: number,
  currentResolution: Buffer,
) => number;

let ntSetTimerResolution: NtSetTimerResolutionFn | null = null;

const getNtSetTimerResolution = (): NtSetTimerResolutionFn | null => {
  if (process.platform !== 'win32') {
    return null;
  }

  if (ntSetTimerResolution) {
    return ntSetTimerResolution;
  }

  const ntdll = koffi.load('ntdll.dll');
  ntSetTimerResolution = ntdll.func('NtSetTimerResolution', 'uint', [
    'uint',
    'uchar',
    koffi.out(koffi.pointer('uint')),
  ]);

  return ntSetTimerResolution;
};

const setTimerResolution = (set: boolean): boolean => {
  const fn = getNtSetTimerResolution();

  if (!fn) {
    return false;
  }

  const current = Buffer.alloc(4);
  const status = fn(DESIRED_RESOLUTION_1MS, set ? 1 : 0, current);

  return status === 0;
};

export const enableHighResolutionTimer = (): boolean => {
  const ok = setTimerResolution(true);

  return ok;
};

export const disableHighResolutionTimer = (): void => {
  setTimerResolution(false);
};
