/**
 * Render a generated Noto Sans TC face in the canonical build-output format.
 *
 * @param {{ src: string, weight: number, unicodeRange: string }} face
 */
export function fontFaceCss({ src, weight, unicodeRange }) {
  return `@font-face {
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('${src}') format('woff2');
  unicode-range: ${unicodeRange};
}`;
}
