// Shared text extraction for ADR-0012 font subsetting and its coverage gate.
//
// Noto Sans TC weight usage is a design-system rule (docs/DESIGN_SYSTEM.md).
// Each weight is subset to the text rendered inside the elements that use it;
// 400 takes all rendered text as a safe superset. The selectors mirror the CSS
// rules (or UA defaults) that set 500 / 700, so text inherits the weight of
// its nearest listed ancestor. A selector is a descendant chain of simple
// compounds: `tag`, `.class` or `tag.class`.

export const FONT_WEIGHTS = [400, 500, 700];

export const WEIGHT_SELECTORS = {
  500: [
    'li',
    '.back-link',
    '.case-hero .case-eyebrow',
    '.next-arrow',
    '.next-meta',
    '.contact-links a',
  ],
  700: [
    'h1',
    'h2',
    'h3',
    '.case-study strong',
    '.hero-headline',
    '.hero-stats dd',
    '.story-title',
    '.pending-label',
  ],
};

// Rules that set a non-400 weight but only ever render Latin text (Instrument
// Sans or the ASCII core baseline). scripts/check-font-coverage.mjs fails on
// any other weight rule in the built CSS, so a new Chinese use of 500 / 700 has
// to be added to WEIGHT_SELECTORS (or, if it is Latin-only, here). The E2E
// platform-font check catches a wrong claim.
export const LATIN_ONLY_WEIGHT_SELECTORS = [
  'a',
  '.card-heading',
  '.case-eyebrow',
  '.contact-title',
  '.credentials span',
  '.detail-eyebrow',
  '.eyebrow',
  '.hero-eyebrow',
  '.outputs-label',
  '.resume-link',
  '.work-cue',
];

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

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

function parseCompound(compound) {
  const match = /^([a-z][\w-]*)?((?:\.[\w-]+)*)$/iu.exec(compound);
  if (!match) throw new Error(`Unsupported weight selector part: ${compound}`);
  return {
    tag: match[1]?.toLowerCase(),
    classes: match[2].split('.').filter(Boolean),
  };
}

const PARSED_WEIGHT_SELECTORS = Object.entries(WEIGHT_SELECTORS).map(
  ([weight, selectors]) => ({
    weight: Number(weight),
    selectors: selectors.map((selector) =>
      selector.trim().split(/\s+/u).map(parseCompound),
    ),
  }),
);

function compoundMatches(compound, element) {
  return (
    (!compound.tag || compound.tag === element.tag) &&
    compound.classes.every((name) => element.classes.includes(name))
  );
}

// `element` is the last entry of `stack`; the earlier parts of the chain must
// match its ancestors in order.
function selectorMatches(parts, stack) {
  if (!compoundMatches(parts.at(-1), stack.at(-1))) return false;
  let index = parts.length - 2;
  for (let depth = stack.length - 2; depth >= 0 && index >= 0; depth -= 1) {
    if (compoundMatches(parts[index], stack[depth])) index -= 1;
  }
  return index < 0;
}

/**
 * Returns the rendered text of an HTML document, split by Noto Sans TC weight.
 * @param {string} html
 * @returns {Record<number, string>}
 */
export function weightedText(html) {
  const body = stripNonText(html);
  /** @type {Record<number, string[]>} */
  const chunks = Object.fromEntries(FONT_WEIGHTS.map((weight) => [weight, []]));
  const stack = [];
  for (const token of body.matchAll(
    /<(\/?)([a-z][\w-]*)\b([^>]*)>|<[^>]*>|([^<]+)/giu,
  )) {
    const [, closing, name, attributes, text] = token;
    if (text !== undefined) {
      const decoded = decodeEntities(text);
      chunks[400].push(decoded);
      for (const weight of stack.at(-1)?.weights ?? []) {
        chunks[weight].push(decoded);
      }
      continue;
    }
    if (!name) continue;
    const tag = name.toLowerCase();
    if (closing) {
      const index = stack.findLastIndex((element) => element.tag === tag);
      if (index >= 0) stack.length = index;
      continue;
    }
    if (VOID_ELEMENTS.has(tag) || attributes.trimEnd().endsWith('/')) continue;
    const classes =
      /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/iu
        .exec(attributes)
        ?.slice(1)
        .find((value) => value !== undefined)
        ?.split(/\s+/u)
        .filter(Boolean) ?? [];
    const element = { tag, classes, weights: new Set(stack.at(-1)?.weights) };
    stack.push(element);
    for (const { weight, selectors } of PARSED_WEIGHT_SELECTORS) {
      if (selectors.some((parts) => selectorMatches(parts, stack))) {
        element.weights.add(weight);
      }
    }
  }
  return Object.fromEntries(
    FONT_WEIGHTS.map((weight) => [weight, chunks[weight].join(' ')]),
  );
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
