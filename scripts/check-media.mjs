import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const mediaDirectory = join(root, 'public', 'media');
const contentDirectory = join(root, 'src', 'content', 'projects');
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
const pending = [];
for (const file of contentFiles) {
  const source = await readFile(file, 'utf8');
  if (/^\s*status:\s*pending\s*$/m.test(source))
    pending.push(relative(root, file));
}

process.stdout.write(
  `${
    pending.length === 0
      ? 'Pending-asset report: no pending media.'
      : `Pending-asset report: ${pending.join(', ')}`
  }\n`,
);

if (pending.length > 0 && process.env.CF_PAGES_BRANCH === 'main') {
  process.stderr.write('Production builds cannot contain pending media.\n');
  process.exitCode = 1;
}
