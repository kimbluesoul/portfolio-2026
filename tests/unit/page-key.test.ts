import { describe, expect, it } from 'vitest';
import { pageKeyFromPath } from '../../src/lib/page-key.mjs';

describe('pageKeyFromPath', () => {
  it.each([
    ['/', 'index'],
    ['/work/88win/', 'work-88win'],
    ['work\\88win\\index.html', 'work-88win'],
    ['404.html', '404'],
    ['/resume/index.html', 'resume'],
  ])('maps %s to %s', (path, expected) => {
    expect(pageKeyFromPath(path)).toBe(expected);
  });
});
