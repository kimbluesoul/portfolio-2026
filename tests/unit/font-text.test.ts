import { describe, expect, it } from 'vitest';
import {
  CORE_BASELINE,
  weightedText,
  withCoreBaseline,
} from '../../scripts/font-text.mjs';

const codePoint = (character: string) => character.codePointAt(0) ?? -1;

describe('ADR-0012 core baseline', () => {
  it('contains the printable ASCII boundaries', () => {
    for (const character of [' ', '!', '0', 'A', 'z', '~']) {
      expect(CORE_BASELINE.has(codePoint(character))).toBe(true);
    }
    expect(CORE_BASELINE.has(0x1f)).toBe(false);
    expect(CORE_BASELINE.has(0x7f)).toBe(false);
  });

  it('contains the common Traditional Chinese punctuation', () => {
    for (const character of [
      '，',
      '。',
      '、',
      '「',
      '」',
      '（',
      '）',
      '…',
      '—',
      '・',
    ]) {
      expect(CORE_BASELINE.has(codePoint(character))).toBe(true);
    }
  });

  it('is merged into every core set without dropping rendered glyphs', () => {
    const core = withCoreBaseline(new Set([codePoint('瞬')]));
    expect(core.has(codePoint('瞬'))).toBe(true);
    expect(core.has(codePoint('」'))).toBe(true);
    expect(core.has(codePoint('~'))).toBe(true);
  });
});

describe('weightedText', () => {
  const html = `<html><head><title>標題列</title></head><body>
    <h1>設計畫面</h1><p>內文</p><ul><li>已上線</li></ul>
    <script>const ignored = '腳本';</script></body></html>`;
  const text = weightedText(html);

  it('assigns headings to 700 and tag chips to 500', () => {
    expect(text[700]).toContain('設計畫面');
    expect(text[700]).not.toContain('內文');
    expect(text[500]).toContain('已上線');
    expect(text[500]).not.toContain('設計畫面');
  });

  it('uses all rendered body text for 400 but skips head and scripts', () => {
    expect(text[400]).toContain('內文');
    expect(text[400]).toContain('已上線');
    expect(text[400]).not.toContain('標題列');
    expect(text[400]).not.toContain('腳本');
  });
});
