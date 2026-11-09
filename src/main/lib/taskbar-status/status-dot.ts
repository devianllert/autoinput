export type StatusDotColor = { r: number; g: number; b: number };

export type StatusDotStyle = {
  /** Bitmap edge length in physical pixels. */
  size: number;
  fill: StatusDotColor;
  border: StatusDotColor;
  /** Border thickness in physical pixels. */
  borderWidth: number;
};

const SUBSAMPLES = 4;

/** Fraction of a pixel covered by a circle, sampled on a SUBSAMPLES x SUBSAMPLES grid. */
const coverage = (x: number, y: number, center: number, radius: number): number => {
  let inside = 0;

  for (let sy = 0; sy < SUBSAMPLES; sy++) {
    for (let sx = 0; sx < SUBSAMPLES; sx++) {
      const dx = x + (sx + 0.5) / SUBSAMPLES - center;
      const dy = y + (sy + 0.5) / SUBSAMPLES - center;

      if (dx * dx + dy * dy <= radius * radius) {
        inside++;
      }
    }
  }

  return inside / (SUBSAMPLES * SUBSAMPLES);
};

/**
 * Draws an anti-aliased filled circle with a border as a premultiplied BGRA bitmap,
 * the layout Electron's nativeImage.createFromBitmap expects.
 */
export const drawStatusDot = ({ size, fill, border, borderWidth }: StatusDotStyle): Buffer => {
  const buffer = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius - borderWidth;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alpha = coverage(x, y, center, outerRadius);
      const fillShare = coverage(x, y, center, innerRadius);
      const borderShare = alpha - fillShare;
      const offset = (y * size + x) * 4;

      buffer[offset] = Math.round(fill.b * fillShare + border.b * borderShare);
      buffer[offset + 1] = Math.round(fill.g * fillShare + border.g * borderShare);
      buffer[offset + 2] = Math.round(fill.r * fillShare + border.r * borderShare);
      buffer[offset + 3] = Math.round(255 * alpha);
    }
  }

  return buffer;
};
