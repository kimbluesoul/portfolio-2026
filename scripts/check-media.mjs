import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const mediaDirectory = join(root, 'public', 'media');
const contentDirectory = join(root, 'src', 'content');
const limits = {
  keyScreen: 8 * 1024 * 1024,
  motion: 4 * 1024 * 1024,
  preview: 3 * 1024 * 1024,
};

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
  if (file.includes('key-main')) return limits.keyScreen;
  if (file.includes('motion-')) return limits.motion;
  return limits.preview;
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
    files.push(expectedFile);
    pending.set(project, files);
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
