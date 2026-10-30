import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import process from 'node:process';
import subsetFont from 'subset-font';

const root = process.cwd();
const distDirectory = join(root, 'dist');
const sourceFontPath = join(
  root,
  'fonts-src',
  'noto-sans-tc',
  'NotoSansTC-wght.ttf',
);
const generatedDirectory = join(root, 'public', '_fonts');
const generatedManifest = join(root, 'src', 'generated', 'font-manifest.json');
const generatedCss = join(root, 'src', 'styles', 'noto-sans-tc.generated.css');
const fontWeights = [400, 500, 700];

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

function decodeEntities(value) {
  const named = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['nbsp', ' '],
    ['quot', '"'],
  ]);
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/giu,
    (entity, decimal, hexadecimal, name) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hexadecimal)
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return named.get(name.toLowerCase()) ?? entity;
    },
  );
}

function visibleHtmlText(html) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/gu, ' ')
      .replace(
        /<(?:script|style|svg)\b[\s\S]*?<\/(?:script|style|svg)>/giu,
        ' ',
      )
      .replace(/<[^>]+>/gu, ' '),
  );
}

function cssContentText(css) {
  return [...css.matchAll(/\bcontent\s*:\s*(['"])(.*?)\1/gsu)]
    .map((match) =>
      match[2]
        .replace(/\\([\da-f]{1,6})\s?/giu, (_, value) =>
          String.fromCodePoint(Number.parseInt(value, 16)),
        )
        .replace(/\\(['"\\])/gu, '$1'),
    )
    .join('');
}

function addRange(target, start, end) {
  for (let codePoint = start; codePoint <= end; codePoint += 1) {
    target.add(codePoint);
  }
}

function codePointsFrom(text) {
  return new Set([...text].map((character) => character.codePointAt(0)));
}

function textFromCodePoints(codePoints) {
  return [...codePoints]
    .sort((left, right) => left - right)
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join('');
}

function unicodeRange(codePoints) {
  const sorted = [...codePoints].sort((left, right) => left - right);
  const ranges = [];
  let start = sorted[0];
  let end = start;
  for (const codePoint of sorted.slice(1)) {
    if (codePoint === end + 1) {
      end = codePoint;
      continue;
    }
    ranges.push([start, end]);
    start = codePoint;
    end = codePoint;
  }
  if (start !== undefined) ranges.push([start, end]);
  return ranges
    .map(([rangeStart, rangeEnd]) =>
      rangeStart === rangeEnd
        ? `U+${rangeStart.toString(16).toUpperCase()}`
        : `U+${rangeStart.toString(16).toUpperCase()}-${rangeEnd
            .toString(16)
            .toUpperCase()}`,
    )
    .join(', ');
}

function isCjkOrFullWidth(codePoint) {
  return (
    (codePoint >= 0x2e80 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xff00 && codePoint <= 0xffef) ||
    (codePoint >= 0x20000 && codePoint <= 0x3134f)
  );
}

const files = await filesBelow(distDirectory);
const htmlFiles = files.filter((file) => extname(file) === '.html');
const cssFiles = files.filter((file) => extname(file) === '.css');
const htmlText = await Promise.all(
  htmlFiles.map(async (file) => ({
    file,
    text: visibleHtmlText(await readFile(file, 'utf8')),
  })),
);
const cssText = (
  await Promise.all(
    cssFiles.map(async (file) => cssContentText(await readFile(file, 'utf8'))),
  )
).join('');
const homeText =
  htmlText.find(({ file }) => file === join(distDirectory, 'index.html'))
    ?.text ?? '';
const coreCodePoints = codePointsFrom(homeText + cssText);
const allCodePoints = codePointsFrom(
  htmlText.map(({ text }) => text).join('') + cssText,
);

addRange(coreCodePoints, 0x20, 0x7e);
addRange(coreCodePoints, 0x3000, 0x303f);
addRange(coreCodePoints, 0xff01, 0xff60);
addRange(coreCodePoints, 0xffe0, 0xffe6);
for (const codePoint of coreCodePoints) allCodePoints.add(codePoint);

const extCodePoints = new Set(
  [...allCodePoints].filter((codePoint) => !coreCodePoints.has(codePoint)),
);
const coveredCodePoints = new Set([...coreCodePoints, ...extCodePoints]);
const missing = [...allCodePoints].filter(
  (codePoint) =>
    isCjkOrFullWidth(codePoint) && !coveredCodePoints.has(codePoint),
);
if (missing.length > 0) {
  throw new Error(
    `CJK subset coverage failed for ${missing
      .map((codePoint) => `U+${codePoint.toString(16).toUpperCase()}`)
      .join(', ')}.`,
  );
}

await mkdir(generatedDirectory, { recursive: true });
const sourceFont = await readFile(sourceFontPath);
const cssBlocks = [
  '/* Generated by scripts/subset-fonts.mjs. Do not edit by hand. */',
];
let home700Core = null;
const subsets = [
  ['core', coreCodePoints],
  ['ext', extCodePoints],
].filter(([, codePoints]) => codePoints.size > 0);

for (const weight of fontWeights) {
  for (const [name, codePoints] of subsets) {
    const subset = await subsetFont(
      sourceFont,
      textFromCodePoints(codePoints),
      {
        targetFormat: 'woff2',
        variationAxes: { wght: weight },
      },
    );
    const hash = createHash('sha256').update(subset).digest('hex').slice(0, 12);
    const filename = `noto-sans-tc-${weight}-${name}.${hash}.woff2`;
    await writeFile(join(generatedDirectory, filename), subset);
    if (weight === 700 && name === 'core') {
      home700Core = `/_fonts/${filename}`;
    }
    cssBlocks.push(`@font-face {
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('/_fonts/${filename}') format('woff2');
  unicode-range: ${unicodeRange(codePoints)};
}`);
  }
}

await writeFile(generatedCss, `${cssBlocks.join('\n\n')}\n`, 'utf8');
await writeFile(
  generatedManifest,
  `${JSON.stringify({ home700Core }, null, 2)}\n`,
  'utf8',
);
process.stdout.write(
  `Generated ${fontWeights.length * subsets.length} deterministic Noto Sans TC subsets; coverage includes ${allCodePoints.size} code points.\n`,
);
