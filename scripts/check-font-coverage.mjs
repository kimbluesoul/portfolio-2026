import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import process from 'node:process';
import {
  codePointsFrom,
  FONT_WEIGHTS,
  isCjkOrFullWidth,
  weightedText,
} from './font-text.mjs';

// ADR-0012 coverage gate: after the final build, every CJK / full-width code
// point rendered at a given Noto Sans TC weight must fall inside a generated
// unicode-range for that weight. Reads only dist/, independent of the subsetter.

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
      `${weight}: ${missing.map((codePoint) => String.fromCodePoint(codePoint)).join('')}`,
    );
  }
  report.push(`${weight}: ${rendered.size}`);
}

if (failures.length > 0) {
  process.stderr.write(
    `Font coverage failed. Rendered CJK glyphs missing from subsets:\n${failures.join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Font coverage OK (rendered CJK code points per weight — ${report.join(', ')}).\n`,
  );
}
