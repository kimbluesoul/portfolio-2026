import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import process from 'node:process';
import { inferMediaSlot, MEDIA_SIZE_LIMITS } from '../src/lib/media-limits.mjs';
import { verifyMediaManifest } from './media-manifest.mjs';

const root = process.cwd();
const mediaDirectory = join(root, 'public', 'media');
const contentDirectory = join(root, 'src', 'content');
const assetsDocument = await readFile(join(root, 'docs', 'ASSETS.md'), 'utf8');
const projectSections = [
  ...assetsDocument.matchAll(/^## .+?[（(]`([a-z0-9-]+)`[）)]\s*$/gmu),
];
const documentedAssetsByProject = new Map(
  projectSections.map((section, index) => {
    const project = section[1];
    const start = section.index ?? 0;
    const end = projectSections[index + 1]?.index ?? assetsDocument.length;
    const names = new Set(
      [
        ...assetsDocument
          .slice(start, end)
          .matchAll(/`([^`/]+\.(?:jpg|mp4|png))`/gu),
      ].map((match) => match[1]),
    );
    return [project, names];
  }),
);
const updateManifest = process.argv.includes('--update-manifest');

async function filesBelow(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) => {
          const path = join(directory, entry.name);
          return entry.isDirectory() ? filesBelow(path) : [path];
        }),
      )
    ).flat();
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
}

function limitFor(file) {
  return MEDIA_SIZE_LIMITS[inferMediaSlot(basename(file))];
}

const manifestResult = await verifyMediaManifest(root, {
  update: updateManifest,
});
for (const file of manifestResult.changed) {
  process.stderr.write(
    `${file}: 內容與 media manifest 不符；請改用新檔名，例如 \`.v2.mp4\`（ARCHITECTURE §9.2）\n`,
  );
  process.exitCode = 1;
}
if (!updateManifest) {
  for (const file of manifestResult.added) {
    process.stderr.write(
      `${file}: 尚未加入 scripts/media-manifest.json；請執行 node scripts/check-media.mjs --update-manifest\n`,
    );
    process.exitCode = 1;
  }
  for (const file of manifestResult.removed) {
    process.stderr.write(
      `${file}: manifest 路徑已不存在；請執行 node scripts/check-media.mjs --update-manifest\n`,
    );
    process.exitCode = 1;
  }
}

const videoFiles = (await filesBelow(mediaDirectory)).filter(
  (file) => extname(file) === '.mp4',
);
const oversized = [];
for (const file of videoFiles) {
  const { size } = await stat(file);
  const limit = limitFor(file);
  if (size > limit) oversized.push({ file: relative(root, file), limit, size });
}

if (oversized.length > 0) {
  for (const { file, limit, size } of oversized) {
    process.stderr.write(`${file}: ${size} bytes exceeds ${limit} bytes\n`);
  }
  process.exitCode = 1;
}

const contentFiles = (await filesBelow(contentDirectory)).filter((file) =>
  ['.yaml', '.yml'].includes(extname(file)),
);
const pending = new Map();
const contentTodos = [];
const undocumentedPending = [];
for (const file of contentFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(
    /^\s*expectedFile:\s*(?:'([^']+)'|"([^"]+)"|([^\s#]+))\s*$/gmu,
  )) {
    const expectedFile = match[1] ?? match[2] ?? match[3];
    if (!expectedFile) continue;
    const project =
      expectedFile.match(/(?:projects|media)\/([a-z0-9-]+)\//u)?.[1] ??
      'unknown';
    const files = pending.get(project) ?? [];
    const expectedFiles = [expectedFile];
    const pendingVideo = expectedFile.match(
      /^public\/media\/([a-z0-9-]+)\/(.+)\.mp4$/u,
    );
    if (pendingVideo?.[1] && pendingVideo[2]) {
      expectedFiles.push(
        `src/assets/projects/${pendingVideo[1]}/${pendingVideo[2]}-poster.jpg`,
      );
    }
    files.push(...expectedFiles);
    pending.set(project, files);
    const documentedAssetNames = documentedAssetsByProject.get(project);
    if (documentedAssetNames) {
      for (const pendingFile of expectedFiles) {
        if (!documentedAssetNames.has(basename(pendingFile))) {
          undocumentedPending.push(pendingFile);
        }
      }
    }
  }
  source.split(/\r?\n/u).forEach((line, index) => {
    if (line.includes('TODO(CONTENT)')) {
      contentTodos.push(`${relative(root, file)}:${index + 1}`);
    }
  });
}

process.stdout.write(
  `${
    pending.size === 0
      ? 'Pending-asset report: no pending media.'
      : `Pending-asset report:\n${[...pending.entries()]
          .map(
            ([project, files]) =>
              `  ${project}:\n${files.map((file) => `    - ${file}`).join('\n')}`,
          )
          .join('\n')}`
  }\n`,
);

if (undocumentedPending.length > 0) {
  process.stderr.write(
    `Pending assets missing from docs/ASSETS.md: ${undocumentedPending.join(', ')}\n`,
  );
  process.exitCode = 1;
}

process.stdout.write(
  `${
    contentTodos.length === 0
      ? 'Content-marker report: no TODO(CONTENT) markers.'
      : `Content-marker report (${contentTodos.length}): ${contentTodos.join(', ')}`
  }\n`,
);

if (pending.size > 0 && process.env.WORKERS_CI_BRANCH === 'main') {
  process.stderr.write('Production builds cannot contain pending media.\n');
  process.exitCode = 1;
}

if (contentTodos.length > 0 && process.env.WORKERS_CI_BRANCH === 'main') {
  process.stderr.write(
    'Production builds cannot contain TODO(CONTENT) markers.\n',
  );
  process.exitCode = 1;
}

// MediaFrame turns `aspectRatio` into a class (CSP forbids inline style). A
// ratio without a matching rule silently falls back to 16 / 9 and
// `object-fit: cover` crops the image, so every ratio class used in the
// built pages must exist in the built CSS.
const distDirectory = join(root, 'dist');
const distFiles = await filesBelow(distDirectory);
const builtCss = (
  await Promise.all(
    distFiles
      .filter((file) => extname(file) === '.css')
      .map((file) => readFile(file, 'utf8')),
  )
).join('\n');
const missingRatios = new Set();
for (const file of distFiles.filter((path) => extname(path) === '.html')) {
  const html = await readFile(file, 'utf8');
  for (const [, ratioClass] of html.matchAll(
    /class="[^"]*?\b((?:mobile-)?ratio-[0-9_x]+)\b/gu,
  )) {
    // 16 / 9 is the .media-frame default and needs no class rule.
    if (ratioClass === 'ratio-16x9') continue;
    if (
      !builtCss.includes(`.${ratioClass}{`) &&
      !builtCss.includes(`.${ratioClass} {`)
    )
      missingRatios.add(ratioClass);
  }
}
if (missingRatios.size > 0) {
  process.stderr.write(
    `Aspect-ratio classes without a CSS rule (add them to src/styles/case.css): ${[...missingRatios].join(', ')}\n`,
  );
  process.exitCode = 1;
}
