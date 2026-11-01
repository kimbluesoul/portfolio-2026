import { describe, expect, it } from 'vitest';
import {
  CORE_BASELINE,
  LATIN_ONLY_WEIGHT_SELECTORS,
  LAYOUT_FEATURES,
  partitionExt,
  WEIGHT_SELECTORS,
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

describe('ADR-0012 layout features', () => {
  it('keeps the features browsers apply to horizontal text by default', () => {
    for (const feature of ['ccmp', 'locl', 'liga', 'kern', 'mark']) {
      expect(LAYOUT_FEATURES).toContain(feature);
    }
  });

  it('drops the vertical, width and alternate forms the site never enables', () => {
    for (const feature of ['vert', 'vrt2', 'fwid', 'hwid', 'pwid', 'aalt']) {
      expect(LAYOUT_FEATURES).not.toContain(feature);
    }
  });
});

describe('weightedText', () => {
  const html = `<html><head><title>標題列</title></head><body>
    <h1>設計畫面</h1><p>內文</p><ul><li>已上線</li></ul>
    <p class="next-meta" data-astro-cid-x>健身房 <span class="next-meta-separator">·</span> 品牌網站</p>
    <script>const ignored = '腳本';</script></body></html>`;
  const text = weightedText(html);

  it('assigns headings to 700 and tag chips to 400', () => {
    expect(text[700]).toContain('設計畫面');
    expect(text[700]).not.toContain('內文');
    expect(text[400]).toContain('已上線');
  });

  it('assigns the case Next meta to 400, including its separators', () => {
    expect(text[400]).toContain('健身房');
    expect(text[400]).toContain('·');
    expect(text[400]).toContain('品牌網站');
  });

  it('uses all rendered body text for 400 but skips head and scripts', () => {
    expect(text[400]).toContain('內文');
    expect(text[400]).toContain('已上線');
    expect(text[400]).not.toContain('標題列');
    expect(text[400]).not.toContain('腳本');
  });

  it('assigns class and descendant selectors, including nested text', () => {
    const caseHtml = `<body><a class="back-link" href="/">← 所有作品</a>
      <article class="case-study">
        <section class="case-section case-hero">
          <p class="case-eyebrow">CASE STUDY 01 · 線上娛樂平台</p>
          <p class="hero-headline">PC <span class="accent">跨裝置</span> 介面</p>
          <dl class="hero-stats"><div><dt>STATUS</dt><dd>已上線</dd></div></dl>
        </section>
        <section class="case-section"><p class="case-eyebrow">OVERVIEW</p>
          <figure><img src="a.jpg" alt="圖說"><figcaption><strong>遊戲列表</strong>說明</figcaption></figure>
        </section>
      </article>
      <dl><dd>清單</dd></dl>
      <footer><strong>頁尾</strong></footer></body>`;
    const weighted = weightedText(caseHtml);

    expect(weighted[400]).toContain('所有作品');
    expect(weighted[700]).toContain('線上娛樂平台');
    expect(weighted[700]).toContain('跨裝置');
    expect(weighted[700]).toContain('已上線');
    expect(weighted[700]).toContain('遊戲列表');
    expect(weighted[700]).not.toContain('說明');
    expect(weighted[700]).not.toContain('STATUS');
    expect(weighted[700]).not.toContain('清單');
    // UA-default bold applies outside .case-study too.
    expect(weighted[700]).toContain('頁尾');
    expect(weighted[400]).not.toContain('圖說');
  });
});

describe('weight selectors', () => {
  it('lists every Chinese 700 use found in the 2026-11-02 audit', () => {
    expect(WEIGHT_SELECTORS[700]).toEqual(
      expect.arrayContaining([
        'h1',
        'h2',
        'h3',
        '.case-study strong',
        '.hero-headline',
        '.hero-stats dd',
        '.story-title',
        '.pending-label',
        '.case-hero .case-eyebrow',
        '.next-arrow',
      ]),
    );
  });

  it('lists the UA-default bold elements, which have no CSS rule to find', () => {
    expect(WEIGHT_SELECTORS[700]).toEqual(
      expect.arrayContaining(['h4', 'h5', 'h6', 'strong', 'b', 'th']),
    );
  });

  it('keeps the arrows Instrument Sans lacks in every core subset', () => {
    for (const arrow of ['←', '→', '↗']) {
      expect(CORE_BASELINE.has(arrow.codePointAt(0)!)).toBe(true);
    }
  });

  it('never marks a Noto weight selector as Latin-only', () => {
    for (const selectors of Object.values(WEIGHT_SELECTORS)) {
      for (const selector of selectors) {
        expect(LATIN_ONLY_WEIGHT_SELECTORS).not.toContain(selector);
      }
    }
  });
});

describe('ADR-0012 per-page ext subsets', () => {
  const points = (text: string) => new Set([...text].map(codePoint));

  it('gives each page its own glyphs and shares the rest', () => {
    const groups = partitionExt(
      new Map([
        ['work-a', points('核心甲甲乙丙')],
        ['work-b', points('核心乙丁戊')],
      ]),
      points('核心'),
      1,
    );
    expect([...groups.keys()]).toEqual(['shared', 'work-a', 'work-b']);
    expect(groups.get('shared')).toEqual(points('乙'));
    expect(groups.get('work-a')).toEqual(points('甲丙'));
    expect(groups.get('work-b')).toEqual(points('丁戊'));
  });

  it('folds a page with too few unique glyphs into shared', () => {
    const groups = partitionExt(
      new Map([
        ['work-a', points('甲乙丙')],
        ['work-b', points('丁')],
      ]),
      new Set(),
      2,
    );
    expect([...groups.keys()]).toEqual(['shared', 'work-a']);
    expect(groups.get('shared')).toEqual(points('丁'));
  });

  it('covers every non-core glyph exactly once', () => {
    const pages = new Map([
      ['work-a', points('甲乙丙丁戊己庚辛')],
      ['work-b', points('乙丁壬癸子丑')],
      ['resume', points('寅')],
    ]);
    const groups = [...partitionExt(pages, points('甲')).values()];
    const all = groups.flatMap((group) => [...group]);
    expect(new Set(all).size).toBe(all.length);
    expect(new Set(all)).toEqual(points('乙丙丁戊己庚辛壬癸子丑寅'));
  });

  it('returns no groups when every glyph is in core', () => {
    expect(
      partitionExt(new Map([['work-a', points('甲')]]), points('甲')).size,
    ).toBe(0);
  });
});
