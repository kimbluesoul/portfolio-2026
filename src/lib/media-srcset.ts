/**
 * Width-based srcsets for case media. Sources are 2x exports (up to 3840 w),
 * so phones must not download the full file (Lighthouse LCP gate).
 *
 * The ladder includes the 1x desktop slot widths (960 motion, 1440 case
 * column, 1920 full bleed): Chrome resamples a non-integer downscale softly
 * (a 2400 w file in a 1920 slot read blurry at DPR 1), so each slot should
 * find a file of its own width.
 */
export const SRCSET_WIDTHS = [
  640, 800, 960, 1200, 1440, 1600, 1920, 2400, 2880,
] as const;

/** A fixed-width desktop slot (Figma 1920 frame) and its `sizes`. */
export interface MediaSlot {
  /** CSS px width of the slot in the 1920 frame. */
  width: number;
  /** Optional CSS px width for an art-directed phone source. */
  mobileWidth?: number;
  sizes: string;
}

/** Case column: full width below 48rem, else the case container (max 90rem). */
export const DEFAULT_MEDIA_SIZES = '(width < 48rem) 100vw, min(100vw, 90rem)';

/** The mosaic is full-bleed: 187.2% of the viewport below 48rem, else 100vw. */
export const MOSAIC_MEDIA_SIZES = '(width < 48rem) 187.2vw, 100vw';

/** Hero and mosaic composites render at 187.2% of the viewport below 48rem. */
export const COMPOSITE_MEDIA_SIZES = '(width < 48rem) 187.2vw, 100vw';

/*
 * Narrow slots. Below the 1920 frame the vw terms track the fluid grid
 * (measured at 1440); at 1920 the max clamps to the Figma width exactly.
 */

/** Key close-ups: the 17.5rem swipe card below 48rem, else a third of the row. */
export const CLOSEUP_SLOT: MediaSlot = {
  width: 459,
  sizes: '(width < 48rem) 17.5rem, min(31vw, 459px)',
};

/** Mobile panels: the 15.625rem swipe card below 48rem, else a third. */
export const PANEL_SLOT: MediaSlot = {
  width: 459,
  sizes: '(width < 48rem) 15.625rem, min(31vw, 459px)',
};

/** Details cards: the media inside a 6-column card grid. */
export const DETAIL_SLOTS = {
  third: { width: 395, sizes: '(width < 48rem) 100vw, min(24vw, 395px)' },
  half: { width: 640, sizes: '(width < 48rem) 100vw, min(40vw, 640px)' },
  'half-tall': {
    width: 640,
    sizes: '(width < 48rem) 100vw, min(40vw, 640px)',
  },
  full: { width: 1376, sizes: '(width < 48rem) 100vw, min(86vw, 1376px)' },
} as const satisfies Record<string, MediaSlot>;

/** 88Win split CARD art: exact desktop slots and 310 px phone slots. */
export const DETAIL_SPLIT_SLOTS = {
  lead: {
    width: 390,
    mobileWidth: 310,
    sizes: '(width < 48rem) 310px, min(25vw, 390px)',
  },
  rest: {
    width: 892,
    mobileWidth: 310,
    sizes: '(width < 48rem) 310px, min(57vw, 892px)',
  },
} as const satisfies Record<string, MediaSlot>;

/** The ladder below the source width, plus the slot's 1x / 2x widths. */
export function srcsetWidthsFor(
  sourceWidth: number,
  slotWidth?: number,
): number[] {
  const slot = slotWidth ? [slotWidth, slotWidth * 2] : [];
  return [...new Set([...SRCSET_WIDTHS, ...slot])]
    .filter((width) => width < sourceWidth)
    .sort((a, b) => a - b)
    .concat(sourceWidth);
}
