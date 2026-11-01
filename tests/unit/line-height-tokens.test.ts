import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokensCss = readFileSync(
  new URL('../../src/styles/tokens.css', import.meta.url),
  'utf8',
);

const lineHeightTokens = [
  ...tokensCss.matchAll(/(--line-height-[\w-]+)\s*:\s*([^;]+);/gu),
].map(([, name = '', value = '']) => [name, value.trim()] as const);

// A unitless number next to a length (`2.194 - 0.454vw`) makes the whole
// clamp() invalid, and the line height silently computes to `normal`.
function mixesNumbersAndLengths(value: string) {
  if (!value.includes('(')) return false;
  const terms = value.match(/-?\d*\.?\d+[a-z%]*/giu) ?? [];
  const unitless = terms.some((term) => /^-?\d*\.?\d+$/u.test(term));
  const withUnit = terms.some((term) => /[a-z%]$/iu.test(term));
  return unitless && withUnit;
}

describe('line-height tokens', () => {
  it('finds the tokens to check', () => {
    expect(lineHeightTokens.map(([name]) => name)).toEqual(
      expect.arrayContaining(['--line-height-body', '--line-height-display']),
    );
  });

  it.each(lineHeightTokens)(
    '%s does not mix unitless numbers with lengths',
    (_name, value) => {
      expect(mixesNumbersAndLengths(value)).toBe(false);
    },
  );

  it('rejects the clamp() that shipped broken before #27', () => {
    expect(mixesNumbersAndLengths('clamp(1.65, 2.194 - 0.454vw, 1.75)')).toBe(
      true,
    );
    expect(
      mixesNumbersAndLengths('clamp(1.875rem, 1.7316rem + 0.588vw, 2.4375rem)'),
    ).toBe(false);
  });
});
