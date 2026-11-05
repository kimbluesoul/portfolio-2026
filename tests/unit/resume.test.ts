import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const resumeUrl = new URL('../../src/content/resume.yaml', import.meta.url);
const resumeSource = readFileSync(resumeUrl, 'utf8');

describe('resume content', () => {
  it('contains no CJK radical code points copied from the PDF text layer', () => {
    expect(resumeSource).not.toMatch(/[\u2e80-\u2fdf]/u);
  });

  it('links exactly six existing project slugs', () => {
    const slugs = [
      ...resumeSource.matchAll(/^\s+slug:\s+([a-z0-9-]+)$/gmu),
    ].map(([, slug]) => slug);

    expect(slugs).toHaveLength(6);
    expect(new Set(slugs).size).toBe(6);
    for (const slug of slugs) {
      expect(
        existsSync(
          new URL(`../../src/content/projects/${slug}.yaml`, import.meta.url),
        ),
        `Missing project content for ${slug}`,
      ).toBe(true);
    }
  });
});
