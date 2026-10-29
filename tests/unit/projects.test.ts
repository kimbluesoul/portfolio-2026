import { describe, expect, it } from 'vitest';
import { getNextProject, orderProjects } from '../../src/lib/projects';

const projects = [
  { order: 1, slug: '88win' },
  { order: 2, slug: 'hwa-fong' },
  { order: 3, slug: 'fitzone' },
  { order: 4, slug: 'sss' },
  { order: 5, slug: 'jhanyu' },
  { order: 6, slug: 'amd' },
  { order: 7, slug: 'huifa' },
] as const;

describe('orderProjects', () => {
  it('sorts projects by their fixed order', () => {
    expect(
      orderProjects([...projects].reverse()).map(({ slug }) => slug),
    ).toEqual(projects.map(({ slug }) => slug));
  });

  it('rejects duplicate order values', () => {
    expect(() =>
      orderProjects([
        { order: 1, slug: 'first' },
        { order: 1, slug: 'duplicate' },
      ]),
    ).toThrow('unique');
  });

  it('rejects gaps in the order', () => {
    expect(() =>
      orderProjects([
        { order: 1, slug: 'first' },
        { order: 3, slug: 'third' },
      ]),
    ).toThrow('contiguous');
  });
});

describe('getNextProject', () => {
  it('returns the next project in order', () => {
    expect(getNextProject(projects, '88win').slug).toBe('hwa-fong');
  });

  it('wraps project 07 back to project 01', () => {
    expect(getNextProject(projects, 'huifa').slug).toBe('88win');
  });
});
