import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { fontFaceCss } from '../../src/lib/font-face-css.mjs';

const execFile = promisify(execFileCallback);
const coverageScript = fileURLToPath(
  new URL('../../scripts/check-font-coverage.mjs', import.meta.url),
);

describe('fontFaceCss', () => {
  it('renders the canonical generated face format', () => {
    expect(
      fontFaceCss({
        src: '/_fonts/noto-sans-tc-400-ext-work-88win.abc123.woff2',
        weight: 400,
        unicodeRange: 'U+4E00, U+4E8C',
      }),
    ).toBe(`@font-face {
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/_fonts/noto-sans-tc-400-ext-work-88win.abc123.woff2') format('woff2');
  unicode-range: U+4E00, U+4E8C;
}`);
  });
});

describe('check-font-coverage', () => {
  it('fails when deferred data-faces and the noscript fallback differ', async () => {
    const root = await mkdtemp(join(tmpdir(), 'font-coverage-'));
    try {
      await mkdir(join(root, 'dist'));
      await writeFile(
        join(root, 'dist', 'index.html'),
        `<noscript><style>@font-face {
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/_fonts/noscript.woff2') format('woff2');
  unicode-range: U+4E00;
}</style></noscript><deferred-fonts data-faces="[{&quot;src&quot;:&quot;/_fonts/data-faces.woff2&quot;,&quot;weight&quot;:400,&quot;unicodeRange&quot;:&quot;U+4E00&quot;}]"></deferred-fonts>`,
      );

      const error = await execFile(process.execPath, [coverageScript], {
        cwd: root,
      }).catch((failure) => failure);

      expect(error.stderr).toContain('Font coverage failed:');
      expect(error.stderr).toContain(
        'index.html: deferred font fallback mismatch',
      );
      expect(error.stderr).toContain('/_fonts/data-faces.woff2');
      expect(error.stderr).toContain('/_fonts/noscript.woff2');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
