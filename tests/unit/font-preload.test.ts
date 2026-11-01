import { describe, expect, it } from 'vitest';
import { bodyFontPreloadHref } from '../../src/lib/font-preload';

describe('bodyFontPreloadHref', () => {
  it('finds the hashed 400 core file in the generated @font-face CSS', () => {
    const css = [
      "src: url('/_fonts/noto-sans-tc-400-ext-shared.7b228d95e378.woff2') format('woff2');",
      "src: url('/_fonts/noto-sans-tc-400-core.21048062d58d.woff2') format('woff2');",
      "src: url('/_fonts/noto-sans-tc-700-core.e958e31b0df3.woff2') format('woff2');",
    ].join('\n');
    expect(bodyFontPreloadHref(css)).toBe(
      '/_fonts/noto-sans-tc-400-core.21048062d58d.woff2',
    );
  });

  it('returns undefined for the empty first-pass stylesheet', () => {
    expect(
      bodyFontPreloadHref(
        '/* Generated during the two-pass ADR-0012 build. */',
      ),
    ).toBeUndefined();
  });
});
