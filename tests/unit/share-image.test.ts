import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getShareImage, shareImageFiles } from '../../src/lib/share-image';

const projectsDirectory = new URL(
  '../../src/content/projects/',
  import.meta.url,
);
const ogDirectory = new URL('../../public/og/', import.meta.url);
const projectSlugs = readdirSync(projectsDirectory)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/u, ''));

describe('share images', () => {
  it('maps every project slug to an existing OG image', () => {
    for (const slug of projectSlugs) {
      expect(shareImageFiles, slug).toHaveProperty(slug);
      const { path } = getShareImage(slug);
      expect(existsSync(new URL(`../../public${path}`, import.meta.url))).toBe(
        true,
      );
    }
  });

  it('uses every file in public/og', () => {
    expect([...readdirSync(ogDirectory)].sort()).toEqual(
      [...Object.values(shareImageFiles)].sort(),
    );
  });

  it('uses versioned filenames', () => {
    for (const file of Object.values(shareImageFiles)) {
      expect(file).toMatch(/\.v\d+\.[^.]+$/u);
    }
  });
});
