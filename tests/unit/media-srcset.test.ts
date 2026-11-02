import { describe, expect, it } from 'vitest';
import {
  CLOSEUP_SLOT,
  DETAIL_SLOTS,
  srcsetWidthsFor,
} from '../../src/lib/media-srcset';

describe('srcsetWidthsFor', () => {
  it('offers the 1x desktop slot widths of a 2x source', () => {
    const widths = srcsetWidthsFor(3840);
    expect(widths).toEqual(expect.arrayContaining([960, 1440, 1920]));
    expect(widths.at(-1)).toBe(3840);
  });

  it('adds a slot at 1x and 2x, below the source width', () => {
    expect(srcsetWidthsFor(918, CLOSEUP_SLOT.width)).toEqual([
      459, 640, 800, 918,
    ]);
    expect(srcsetWidthsFor(2752, DETAIL_SLOTS.full.width)).toEqual([
      640, 800, 960, 1200, 1376, 1440, 1600, 1920, 2400, 2752,
    ]);
  });

  it('never repeats the source width', () => {
    expect(srcsetWidthsFor(1920)).toEqual([
      640, 800, 960, 1200, 1440, 1600, 1920,
    ]);
  });
});
