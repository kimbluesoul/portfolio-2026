import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import process from 'node:process';
import {
  codePointsFrom,
  FONT_WEIGHTS,
  isCjkOrFullWidth,
  LATIN_ONLY_WEIGHT_SELECTORS,
  WEIGHT_SELECTORS,
  weightedText,
} from './font-text.mjs';

// ADR-0012 coverage gate: after the final build, every CJK / full-width code
// point rendered at a given Noto Sans TC weight must fall inside a generated
// unicode-range for that weight. Reads only dist/, independent of the subsetter.
// Two CSS checks keep the per-weight text extraction honest (ADR-0012
// amendment 2026-11-01): every font-family stack names Noto Sans TC, and every
// rule that sets a weight other than 400 is listed in WEIGHT_SELECTORS for that
// weight or in LATIN_ONLY_WEIGHT_SELECTORS.

const distDirectory = join(process.cwd(), 'dist');

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? filesBelow(path) : [path];
      }),
    )
  ).flat();
}

function parseRanges(value) {
  return value.split(',').map((part) => {
    const [start, end = start] = part
      .trim()
      .replace(/^U\+/iu, '')
      .split('-')
      .map((hex) => Number.parseInt(hex, 16));
    return [start, end];
  });
}

const files = await filesBelow(distDirectory);
const css = (
  await Promise.all(
    files
      .filter((file) => extname(file) === '.css')
      .map((file) => readFile(file, 'utf8')),
  )
).join('\n');

const rangesByWeight = new Map();
for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/gu)) {
  const body = block[1];
  if (!/font-family:\s*['"]?Noto Sans TC/iu.test(body)) continue;
  const weight = Number(body.match(/font-weight:\s*(\d+)/u)?.[1]);
  // Minified CSS drops the final semicolon, so stop at `;` or end of block.
  const range = body.match(/unicode-range:\s*([^;]+)/u)?.[1];
  if (!weight || !range) continue;
  const list = rangesByWeight.get(weight) ?? [];
  list.push(...parseRanges(range));
  rangesByWeight.set(weight, list);
}

const renderedByWeight = new Map(
  FONT_WEIGHTS.map((weight) => [weight, new Set()]),
);
for (const file of files.filter((path) => extname(path) === '.html')) {
  const text = weightedText(await readFile(file, 'utf8'));
  for (const weight of FONT_WEIGHTS) {
    for (const codePoint of codePointsFrom(text[weight])) {
      if (isCjkOrFullWidth(codePoint))
        renderedByWeight.get(weight).add(codePoint);
    }
  }
}

const failures = [];
const report = [];
for (const [weight, rendered] of renderedByWeight) {
  if (rendered.size === 0) continue;
  const ranges = rangesByWeight.get(weight) ?? [];
  const missing = [...rendered].filter(
    (codePoint) =>
      !ranges.some(([start, end]) => codePoint >= start && codePoint <= end),
  );
  if (missing.length > 0) {
    failures.push(
      `${weight}: rendered CJK glyphs missing from the subsets: ${missing.map((codePoint) => String.fromCodePoint(codePoint)).join('')}`,
    );
  }
  report.push(`${weight}: ${rendered.size}`);
}

// Splits a selector list at top-level commas (not inside :is() / :not()).
function splitSelectorList(selectorList) {
  const selectors = [''];
  let depth = 0;
  for (const character of selectorList) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) selectors.push('');
    else selectors[selectors.length - 1] += character;
  }
  return selectors;
}

// Drops Astro's scoping attributes so the selector reads as in the source.
function normalizeSelector(selector) {
  return selector
    .replace(/\[data-astro-cid-[\w-]+\]/gu, '')
    .replace(/:where\(\.astro-[\w-]+\)/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

const NAMED_WEIGHTS = new Map([
  ['normal', 400],
  ['bold', 700],
]);

// Innermost rules only: a rule nested in @media matches after the at-rule's `{`.
for (const [, selectorList, declarations] of css.matchAll(
  /([^{}]+)\{([^{}]*)\}/gu,
)) {
  if (selectorList.trim().startsWith('@')) continue;
  for (const [, family] of declarations.matchAll(
    /(?:^|;)\s*(?:font-family|--font-family-[\w-]+)\s*:\s*([^;]+)/gu,
  )) {
    if (/var\(|inherit|initial|unset/u.test(family)) continue;
    if (!/Noto Sans TC/iu.test(family)) {
      failures.push(`font stack without Noto Sans TC: ${family.trim()}`);
    }
  }
  // The weight check reads only literal font-weight values, so a `font:`
  // shorthand or a computed weight would slip past it.
  const shorthand = declarations
    .match(/(?:^|;)\s*font\s*:\s*([^;]+)/u)?.[1]
    ?.trim();
  if (shorthand && !/^(?:inherit|initial|unset|revert)$/u.test(shorthand)) {
    failures.push(
      `font shorthand on "${normalizeSelector(selectorList)}": use font-family / font-weight so the gate can read them`,
    );
  }
  const value = declarations
    .match(/(?:^|;)\s*font-weight\s*:\s*([^;]+)/u)?.[1]
    ?.trim();
  if (!value) continue;
  const weight = NAMED_WEIGHTS.get(value) ?? Number(value);
  if (Number.isNaN(weight)) {
    failures.push(
      `font-weight ${value} on "${normalizeSelector(selectorList)}" is not a number, normal or bold`,
    );
    continue;
  }
  if (weight === 400) continue;
  // With faces at 400 / 500 / 700 only, CSS font matching draws any weight
  // above 500 (for example 600) with the 700 face.
  const faceWeight = weight > 500 ? 700 : weight;
  for (const selector of splitSelectorList(selectorList).map(
    normalizeSelector,
  )) {
    if (
      WEIGHT_SELECTORS[faceWeight]?.includes(selector) ||
      LATIN_ONLY_WEIGHT_SELECTORS.includes(selector)
    )
      continue;
    failures.push(
      `font-weight ${value} on "${selector}" is not listed in WEIGHT_SELECTORS[${faceWeight}] or LATIN_ONLY_WEIGHT_SELECTORS (scripts/font-text.mjs)`,
    );
  }
}

if (failures.length > 0) {
  process.stderr.write(`Font coverage failed:\n${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Font coverage OK (rendered CJK code points per weight — ${report.join(', ')}).\n`,
  );
}
