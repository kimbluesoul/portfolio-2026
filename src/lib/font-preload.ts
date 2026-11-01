/**
 * ADR-0012 amendment (2026-11-01, case LCP): case pages preload the 400
 * `core` subset, the largest file their first paint needs. Its hashed name
 * only exists after the subset pass, so it is read from the generated
 * `@font-face` CSS. The first build pass has no fonts yet and gets `undefined`.
 */
export function bodyFontPreloadHref(generatedCss: string): string | undefined {
  return /url\(['"]?(\/_fonts\/noto-sans-tc-400-core\.[\da-f]+\.woff2)['"]?\)/u.exec(
    generatedCss,
  )?.[1];
}
