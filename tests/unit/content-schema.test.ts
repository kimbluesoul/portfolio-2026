import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { createImageMediaSchemas } from '../../src/lib/image-media-schema';

describe('mobileMedia schema', () => {
  const { imageMedia } = createImageMediaSchemas(() => z.string());

  it('accepts image media', () => {
    expect(
      imageMedia.safeParse({ kind: 'image', src: 'mobile.png', alt: 'Mobile' })
        .success,
    ).toBe(true);
  });

  it('rejects video media', () => {
    expect(
      imageMedia.safeParse({
        kind: 'video',
        src: '/media/demo/mobile.mp4',
        poster: 'poster.jpg',
        alt: 'Mobile',
      }).success,
    ).toBe(false);
  });
});
