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
    'keeps each section tone fixed for combination %i',
    (mask) => {
      const toned = assignTones(getCaseSections(combination(mask)));
      const tones = Object.fromEntries(
        toned.map(({ key, tone }) => [key, tone]),
      );

      expect(tones).toMatchObject({
        hero: 'canvas',
        overview: 'canvas',
        keyScreens: 'surface',
        links: 'inverse',
        nextProject: 'canvas',
      });
      if (combination(mask).mobile) expect(tones.mobile).toBe('canvas');
      if (combination(mask).motion) expect(tones.motion).toBe('inverse');
      if (combination(mask).details) expect(tones.details).toBe('surface');
      if (combination(mask).visualExtension) {
        expect(tones.visualExtension).toBe('canvas');
      }
    },
  );

  it('maps an arbitrary valid section order to its fixed tones', () => {
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
      'canvas',
      'canvas',
      'inverse',
      'canvas',
    ]);
  });
});
