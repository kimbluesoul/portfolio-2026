/**
 * Mobile (390) case-title sizes used by the Figma frames (ARCHITECTURE §10
 * v1.8). Each size has exactly one CSS rule, `.title-mobile-<size>`, in
 * `src/styles/case.css`. To add a size, add it here and add its rule; the
 * unit test fails if either side is missing. A size outside this list fails
 * the content build instead of rendering at the wrong size.
 */
export const caseTitleSizesMobile = [56, 76] as const;

export type CaseTitleSizeMobile = (typeof caseTitleSizesMobile)[number];

export const caseTitleMobileClass = (size: CaseTitleSizeMobile) =>
  `title-mobile-${size}`;

export const isCaseTitleSizeMobile = (
  size: number,
): size is CaseTitleSizeMobile =>
  (caseTitleSizesMobile as readonly number[]).includes(size);
