import { describe, expect, it } from 'vitest';
import {
  assignTones,
  getCaseSections,
  type CaseSection,
  type OptionalSections,
} from '../../src/lib/sections';

const optionalKeys = [
  'mobile',
  'motion',
  'details',
  'visualExtension',
] as const;

function combination(mask: number): OptionalSections {
  return Object.fromEntries(
    optionalKeys.map((key, index) => [key, Boolean(mask & (1 << index))]),
  ) as unknown as OptionalSections;
}

describe('getCaseSections', () => {
  it('preserves the fixed section order', () => {
    expect(
      getCaseSections({
        details: true,
        mobile: true,
        motion: true,
        visualExtension: true,
      }),
    ).toEqual([
      'hero',
      'overview',
      'keyScreens',
      'mobile',
      'motion',
      'details',
      'visualExtension',
      'links',
      'nextProject',
    ]);
  });

  it.each(Array.from({ length: 16 }, (_, mask) => mask))(
    'omits absent optional sections for combination %i',
    (mask) => {
      const optional = combination(mask);
      const sections = getCaseSections(optional);

      for (const key of optionalKeys) {
        expect(sections.includes(key)).toBe(optional[key]);
      }
    },
  );
});

describe('assignTones', () => {
  it.each(Array.from({ length: 16 }, (_, mask) => mask))(
    'recomputes tone after omissions for combination %i',
    (mask) => {
      const toned = assignTones(getCaseSections(combination(mask)));
      const light = toned.filter(
        ({ tone }) => tone === 'canvas' || tone === 'surface',
      );

      light.forEach(({ tone }, index) => {
        expect(tone).toBe(index % 2 === 0 ? 'canvas' : 'surface');
      });

      expect(toned.find(({ key }) => key === 'links')?.tone).toBe('inverse');
      if (combination(mask).motion) {
        expect(toned.find(({ key }) => key === 'motion')?.tone).toBe('inverse');
      }
      if (combination(mask).visualExtension) {
        expect(toned.find(({ key }) => key === 'visualExtension')?.tone).toBe(
          'media',
        );
      }
    },
  );

  it('does not let media or inverse sections advance the light alternation', () => {
    const sections: CaseSection[] = [
      'hero',
      'motion',
      'visualExtension',
      'overview',
      'links',
      'nextProject',
    ];
    expect(assignTones(sections).map(({ tone }) => tone)).toEqual([
      'canvas',
      'inverse',
      'media',
      'surface',
      'inverse',
      'canvas',
    ]);
  });
});
