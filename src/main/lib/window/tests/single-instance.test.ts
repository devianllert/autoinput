import { beforeEach, describe, expect, it, vi } from 'vitest';

import { acquireSingleInstanceLock } from '../single-instance';

const mocks = vi.hoisted(() => ({
  requestSingleInstanceLock: vi.fn(),
  on: vi.fn(),
}));

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: mocks.requestSingleInstanceLock,
    on: mocks.on,
  },
}));

describe('acquireSingleInstanceLock', () => {
  beforeEach(() => {
    mocks.requestSingleInstanceLock.mockReset();
    mocks.on.mockReset();
  });

  it('subscribes to later launches when this is the first instance', () => {
    const onSecondInstance = vi.fn();
    mocks.requestSingleInstanceLock.mockReturnValue(true);

    expect(acquireSingleInstanceLock(onSecondInstance)).toBe(true);
    expect(mocks.on).toHaveBeenCalledExactlyOnceWith('second-instance', onSecondInstance);
  });

  it('reports failure without subscribing when another instance holds the lock', () => {
    mocks.requestSingleInstanceLock.mockReturnValue(false);

    expect(acquireSingleInstanceLock(vi.fn())).toBe(false);
    expect(mocks.on).not.toHaveBeenCalled();
  });
});
