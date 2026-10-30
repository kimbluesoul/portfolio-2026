import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const assetDirectory = join(root, 'dist', '_astro');
const limits = {
  '.css': 40 * 1024,
  '.js': 15 * 1024,
};

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

const totals = { '.css': 0, '.js': 0 };
for (const file of await filesBelow(assetDirectory)) {
  const extension = extname(file);
  if (!(extension in limits)) continue;
  totals[extension] += gzipSync(await readFile(file)).byteLength;
}

let failed = false;
for (const [extension, total] of Object.entries(totals)) {
  const limit = limits[extension];
  const label = extension === '.css' ? 'CSS' : 'first-party JS';
  process.stdout.write(`${label} gzip budget: ${total} / ${limit} bytes.\n`);
  if (total > limit) {
    process.stderr.write(
      `${label} assets exceed the gzip budget by ${total - limit} bytes (${relative(root, assetDirectory)}).\n`,
    );
    failed = true;
  }
}

if (failed) process.exitCode = 1;
