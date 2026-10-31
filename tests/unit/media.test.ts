import { describe, expect, it } from 'vitest';
import {
  MEDIA_SIZE_LIMITS,
  collectPendingMedia,
  inferMediaSlot,
  isWithinMediaLimit,
  pendingVideoPoster,
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

  it('reports pending image and video media recursively', () => {
    expect(
      collectPendingMedia({
        hero: {
          kind: 'image',
          src: 'placeholder.png',
          status: 'pending',
          expectedFile: 'src/assets/projects/88win/hero.png',
        },
        motion: [
          {
            kind: 'video',
            src: '/media/88win/motion-1.mp4',
            status: 'pending',
            expectedFile: 'public/media/88win/motion-1.mp4',
          },
        ],
      }),
    ).toEqual([
      {
        expectedFile: 'src/assets/projects/88win/hero.png',
        path: 'root.hero',
        project: '88win',
      },
      {
        expectedFile: 'public/media/88win/motion-1.mp4',
        path: 'root.motion[0]',
        project: '88win',
      },
      {
        expectedFile: 'src/assets/projects/88win/motion-1-poster.jpg',
        path: 'root.motion[0]',
        project: '88win',
      },
    ]);
  });

  it('derives the required poster name for pending video assets', () => {
    expect(pendingVideoPoster('public/media/88win/key-main.mp4')).toBe(
      'src/assets/projects/88win/key-main-poster.jpg',
    );
    expect(pendingVideoPoster('src/assets/projects/88win/card.jpg')).toBeNull();
  });
});
