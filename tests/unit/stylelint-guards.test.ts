import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

const configFile = fileURLToPath(
  new URL('../../.stylelintrc.json', import.meta.url),
);

const lint = (code: string) => stylelint.lint({ code, configFile });

describe('stylelint typography guards', () => {
  it.each([
    ['font-feature-settings', '.example { font-feature-settings: "kern"; }'],
    [
      'font-variant and font-variant-*',
      '.example { font-variant: small-caps; font-variant-ligatures: none; }',
    ],
    [
      'vertical and sideways writing modes',
      '.example { writing-mode: vertical-rl; }\n.other { writing-mode: sideways-lr; }',
    ],
  ])('rejects %s', async (_name, code) => {
    const result = await lint(code);
    expect(result.errored).toBe(true);
    expect(result.results[0]?.warnings.length).toBeGreaterThan(0);
  });

  it('accepts ordinary horizontal CSS', async () => {
    const result = await lint(
      '.example {\n  display: block;\n  writing-mode: horizontal-tb;\n}',
    );
    expect(result.errored).toBe(false);
    expect(result.results[0]?.warnings).toEqual([]);
  });
});
