import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const headersFile = readFileSync(
  new URL('../../public/_headers', import.meta.url),
  'utf8',
);
const blocks = new Map(
  headersFile
    .trim()
    .split(/\r?\n\r?\n/u)
    .map((block) => {
      const [path, ...headers] = block.split(/\r?\n/u);
      return [path, headers.map((header) => header.trim())] as const;
    }),
);
const immutableCacheControl =
  'Cache-Control: public, max-age=31536000, immutable';

describe('versioned asset cache headers', () => {
  for (const path of ['/_astro/*', '/_fonts/*', '/media/*', '/og/*']) {
    it(`${path} replaces inherited cache control with an immutable value`, () => {
      const headers = blocks.get(path);
      expect(headers).toContain('! Cache-Control');
      expect(headers).toContain(immutableCacheControl);
    });
  }
});
