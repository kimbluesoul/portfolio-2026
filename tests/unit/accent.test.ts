import { describe, expect, it } from 'vitest';
import { splitAccent } from '../../src/lib/accent';

describe('splitAccent', () => {
  it('splits plain and accent text without producing HTML', () => {
    expect(splitAccent('一套**介面規則**')).toEqual([
      { accent: false, text: '一套' },
      { accent: true, text: '介面規則' },
    ]);
  });

  it('leaves unmatched markers as plain text', () => {
    expect(splitAccent('一套**介面規則')).toEqual([
      { accent: false, text: '一套**介面規則' },
    ]);
  });
});
