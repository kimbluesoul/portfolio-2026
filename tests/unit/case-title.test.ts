import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  caseTitleMobileClass,
  caseTitleSizesMobile,
  isCaseTitleSizeMobile,
} from '../../src/lib/case-title';

const caseCss = readFileSync(
  new URL('../../src/styles/case.css', import.meta.url),
  'utf8',
);

describe('mobile case-title sizes', () => {
  it.each(caseTitleSizesMobile)('size %i has exactly one CSS rule', (size) => {
    const rule = new RegExp(
      String.raw`\.hero-copy h1\.${caseTitleMobileClass(size)} \{\s*font-size: ${size / 16}rem;`,
      'g',
    );
    expect(caseCss.match(rule)).toHaveLength(1);
  });

  it('has no CSS rule for a size outside the list', () => {
    const declared = [...caseCss.matchAll(/\.title-mobile-(\d+)\b/g)].map(
      ([, size]) => Number(size),
    );
    expect(declared.every(isCaseTitleSizeMobile)).toBe(true);
  });

  it('rejects sizes outside the list', () => {
    expect(isCaseTitleSizeMobile(76)).toBe(true);
    expect(isCaseTitleSizeMobile(64)).toBe(false);
  });
});
