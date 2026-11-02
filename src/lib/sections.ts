export type CaseSection =
  | 'hero'
  | 'overview'
  | 'keyScreens'
  | 'mobile'
  | 'motion'
  | 'details'
  | 'visualExtension'
  | 'links'
  | 'nextProject';

export type SectionTone = 'canvas' | 'surface' | 'inverse';

export interface OptionalSections {
  details: boolean;
  mobile: boolean;
  motion: boolean;
  visualExtension: boolean;
}

export interface TonedSection {
  key: CaseSection;
  tone: SectionTone;
}

export function getCaseSections(optional: OptionalSections): CaseSection[] {
  return [
    'hero',
    'overview',
    'keyScreens',
    ...(optional.mobile ? (['mobile'] as const) : []),
    ...(optional.motion ? (['motion'] as const) : []),
    ...(optional.details ? (['details'] as const) : []),
    ...(optional.visualExtension ? (['visualExtension'] as const) : []),
    'links',
    'nextProject',
  ];
}

export function assignTones(sections: readonly CaseSection[]): TonedSection[] {
  return sections.map((key) => {
    if (key === 'motion' || key === 'links') {
      return { key, tone: 'inverse' };
    }

    if (key === 'keyScreens' || key === 'details') {
      return { key, tone: 'surface' };
    }

    return { key, tone: 'canvas' };
  });
}
