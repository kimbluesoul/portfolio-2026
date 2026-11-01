/**
 * Width-based srcsets for case media. Sources are 2x exports (up to 3840 w),
 * so phones must not download the full file (Lighthouse LCP gate).
 */
export const SRCSET_WIDTHS = [640, 800, 1200, 1600, 2400, 2880] as const;

/** Case column: full width below 48rem, else the case container (max 90rem). */
export const DEFAULT_MEDIA_SIZES = '(width < 48rem) 100vw, min(100vw, 90rem)';

/** Key closeups: the 17.5rem swipe card below 48rem, else a third of the row. */
export const CLOSEUP_MEDIA_SIZES = '(width < 48rem) 17.5rem, min(33vw, 30rem)';

/** Hero and mosaic composites render at 187.2% of the viewport below 48rem. */
export const COMPOSITE_MEDIA_SIZES =
  '(width < 48rem) 187.2vw, min(100vw, 90rem)';

export function srcsetWidthsFor(sourceWidth: number): number[] {
  return [...SRCSET_WIDTHS.filter((width) => width < sourceWidth), sourceWidth];
}
