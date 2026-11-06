import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const smokeSpec = fileURLToPath(
  new URL('../e2e/smoke.spec.ts', import.meta.url),
);

const scrollCall = /\b(?:scrollTo|scrollBy|scrollIntoView)\s*\(/gu;
const behavior = /\bbehavior\s*:\s*['"](?:instant|smooth)['"]/u;

function scrollCalls(source: string) {
  return [...source.matchAll(scrollCall)].map((match) => {
    let depth = 1;
    let index = match.index + match[0].length;

    for (; index < source.length && depth > 0; index += 1) {
      if (source[index] === '(') depth += 1;
      if (source[index] === ')') depth -= 1;
    }

    return source.slice(match.index, index);
  });
}

describe('E2E scroll guard', () => {
  it('uses an explicit scroll behavior for every programmatic scroll', async () => {
    const source = await readFile(smokeSpec, 'utf8');
    const missingBehavior = scrollCalls(source).filter(
      (call) => !behavior.test(call),
    );

    expect(
      missingBehavior,
      'All programmatic scrolls need an explicit behavior because the site enables smooth scrolling globally (DESIGN_SYSTEM → Motion).',
    ).toEqual([]);
  });
});
