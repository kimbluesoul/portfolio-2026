// Shared text extraction for ADR-0012 font subsetting and its coverage gate.
//
// Noto Sans TC weight usage is a design-system rule (docs/DESIGN_SYSTEM.md):
//   700 — headings only (h1, h2, h3)
//   500 — tag chips only (li)
//   400 — everything else
// Each weight is subset to the text rendered in those elements. 400 takes all
// rendered text as a safe superset.

export const FONT_WEIGHTS = [400, 500, 700];

const WEIGHT_ELEMENTS = {
  500: ['li'],
  700: ['h1', 'h2', 'h3'],
};

// ADR-0012 §5 (amended): every weight's `core` subset always contains printable
// ASCII and the common Traditional Chinese punctuation, so copy edits do not
// reshuffle these glyphs between core and ext.
const ZH_HANT_PUNCTUATION = '　，。、；：？！「」『』（）《》〈〉【】…—～・';

export const CORE_BASELINE = new Set([
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, index) => 0x20 + index),
  ...[...ZH_HANT_PUNCTUATION].map((character) => character.codePointAt(0)),
]);

// ADR-0012 amendment (2026-11-01): OpenType features kept in the subsets. These
// are the Noto Sans TC features a browser applies to horizontal text by default,
// plus the GPOS-only proportional / half-width alternates (no extra glyphs).
// Vertical forms (vert, vrt2), width variants (fwid, hwid, pwid), aalt, dlig,
// hist and ruby are dropped: the site never enables them, and their glyph
// closure nearly doubled every subset. A new `font-feature-settings`,
// `font-variant-*` or vertical `writing-mode` needs its feature added here.
export const LAYOUT_FEATURES = [
  'ccmp',
  'locl',
  'liga',
  'kern',
  'mark',
  'palt',
  'halt',
];

/** Returns `codePoints` plus the fixed core baseline. */
export function withCoreBaseline(codePoints) {
  return new Set([...CORE_BASELINE, ...codePoints]);
}

const NAMED_ENTITIES = new Map([
  ['amp', '&'],
  ['apos', "'"],
  ['gt', '>'],
  ['lt', '<'],
  ['nbsp', ' '],
  ['quot', '"'],
]);

function decodeEntities(value) {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/giu,
    (entity, decimal, hexadecimal, name) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hexadecimal)
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return NAMED_ENTITIES.get(name.toLowerCase()) ?? entity;
    },
  );
}

function stripNonText(html) {
  return (
    html
      .replace(/<!--[\s\S]*?-->/gu, ' ')
      // <head> text (title, meta) is never drawn with the page font.
      .replace(/<head\b[\s\S]*?<\/head>/giu, ' ')
      .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/giu, ' ')
  );
}

function textOf(fragment) {
  return decodeEntities(fragment.replace(/<[^>]+>/gu, ' '));
}

/**
 * Returns the rendered text of an HTML document, split by Noto Sans TC weight.
 * @param {string} html
 * @returns {Record<number, string>}
 */
export function weightedText(html) {
  const body = stripNonText(html);
  const all = textOf(body);
  /** @type {Record<number, string>} */
  const byWeight = { 400: all };
  for (const [weight, tags] of Object.entries(WEIGHT_ELEMENTS)) {
    byWeight[weight] = tags
      .flatMap((tag) =>
        [
          ...body.matchAll(
            new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'giu'),
          ),
        ].map((match) => textOf(match[1])),
      )
      .join(' ');
  }
  return byWeight;
}

export function isCjkOrFullWidth(codePoint) {
  return (
    (codePoint >= 0x2e80 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xff00 && codePoint <= 0xffef) ||
    (codePoint >= 0x20000 && codePoint <= 0x3134f)
  );
}

export function codePointsFrom(text) {
  return new Set([...text].map((character) => character.codePointAt(0)));
}
