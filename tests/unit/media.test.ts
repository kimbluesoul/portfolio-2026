import { describe, expect, it } from 'vitest';
import {
  MEDIA_SIZE_LIMITS,
  collectPendingMedia,
  inferMediaSlot,
  isWithinMediaLimit,
} from '../../src/lib/media';

describe('media helpers', () => {
  it('infers media limits from slot filenames', () => {
    expect(inferMediaSlot('key-main.mp4')).toBe('key-screen');
    expect(inferMediaSlot('motion-1.v2.mp4')).toBe('motion-step');
    expect(inferMediaSlot('card-preview.mp4')).toBe('preview');
  });

  it('enforces the hard size cap', () => {
    expect(isWithinMediaLimit(MEDIA_SIZE_LIMITS.preview, 'preview')).toBe(true);
    expect(isWithinMediaLimit(MEDIA_SIZE_LIMITS.preview + 1, 'preview')).toBe(
      false,
    );
  });

  it('reports pending video media recursively', () => {
    expect(
      collectPendingMedia({
        hero: { kind: 'image', src: 'hero.png' },
        motion: [
          {
            kind: 'video',
            src: '/media/88win/motion-1.mp4',
            status: 'pending',
          },
        ],
      }),
    ).toEqual([
      {
        path: 'root.motion[0]',
        src: '/media/88win/motion-1.mp4',
      },
    ]);
  });
});
