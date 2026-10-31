export interface AccentSegment {
  accent: boolean;
  text: string;
}

export function splitAccent(value: string): AccentSegment[] {
  return value
    .split(/(\*\*[^*]+\*\*)/u)
    .filter(Boolean)
    .map((segment) => ({
      accent: segment.startsWith('**') && segment.endsWith('**'),
      text:
        segment.startsWith('**') && segment.endsWith('**')
          ? segment.slice(2, -2)
          : segment,
    }));
}
