import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const mediaExtensions = new Set(['.mp4', '.webm']);

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

async function readManifest(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') return {};
    throw error;
  }
}

function sortedRecord(record) {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );
}

/**
 * Compare delivery-media hashes with the committed manifest. Update mode may
 * add new paths and remove deleted paths, but deliberately preserves the hash
 * of every existing path.
 *
 * @param {string} root
 * @param {{ update?: boolean }} options
 */
export async function verifyMediaManifest(root, { update = false } = {}) {
  const mediaDirectory = join(root, 'public', 'media');
  const manifestPath = join(root, 'scripts', 'media-manifest.json');
  const manifest = await readManifest(manifestPath);
  const current = {};
  const mediaFiles = (await filesBelow(mediaDirectory)).filter((file) =>
    mediaExtensions.has(extname(file).toLowerCase()),
  );

  for (const file of mediaFiles) {
    const path = relative(root, file).split(sep).join('/');
    current[path] = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
  }

  const changed = Object.keys(current).filter(
    (path) => manifest[path] !== undefined && manifest[path] !== current[path],
  );
  const added = Object.keys(current).filter(
    (path) => manifest[path] === undefined,
  );
  const removed = Object.keys(manifest).filter(
    (path) => current[path] === undefined,
  );

  if (update && (added.length > 0 || removed.length > 0)) {
    const updated = { ...manifest };
    for (const path of added) updated[path] = current[path];
    for (const path of removed) delete updated[path];
    await writeFile(
      manifestPath,
      `${JSON.stringify(sortedRecord(updated), null, 2)}\n`,
      'utf8',
    );
  }

  return { added, changed, removed };
}
