import { describe, expect, it } from 'vitest';

import { drawStatusDot } from '../status-dot';

const style = {
  size: 32,
  fill: { r: 34, g: 197, b: 94 },
  border: { r: 255, g: 255, b: 255 },
  borderWidth: 3,
};

const pixel = (buffer: Buffer, size: number, x: number, y: number): number[] => {
  const offset = (y * size + x) * 4;
  return [...buffer.subarray(offset, offset + 4)];
};

describe('drawStatusDot', () => {
  it('produces a BGRA buffer of the requested size', () => {
    expect(drawStatusDot(style).length).toBe(32 * 32 * 4);
  });

  it('fills the center with the fill color in BGRA order', () => {
    expect(pixel(drawStatusDot(style), 32, 16, 16)).toEqual([94, 197, 34, 255]);
  });

  it('draws the border color near the edge', () => {
    expect(pixel(drawStatusDot(style), 32, 16, 1)).toEqual([255, 255, 255, 255]);
  });

  it('leaves the corners transparent', () => {
    expect(pixel(drawStatusDot(style), 32, 0, 0)).toEqual([0, 0, 0, 0]);
  });
});
