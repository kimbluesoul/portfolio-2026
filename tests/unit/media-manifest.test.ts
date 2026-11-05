import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyMediaManifest } from '../../scripts/media-manifest.mjs';

const workspaces: string[] = [];
const checkMediaScript = fileURLToPath(
  new URL('../../scripts/check-media.mjs', import.meta.url),
);

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

async function createWorkspace(content: string, manifest: object) {
  const root = await mkdtemp(join(tmpdir(), 'media-manifest-'));
  workspaces.push(root);
  await mkdir(join(root, 'public', 'media', 'demo'), { recursive: true });
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, 'docs'), { recursive: true });
  await writeFile(join(root, 'public', 'media', 'demo', 'clip.mp4'), content);
  await writeFile(join(root, 'docs', 'ASSETS.md'), '');
  await writeFile(
    join(root, 'scripts', 'media-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    workspaces
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('media manifest', () => {
  it('detects changed content at an existing path', async () => {
    const root = await createWorkspace('new bytes', {
      'public/media/demo/clip.mp4': sha256('old bytes'),
    });

    const result = spawnSync(process.execPath, [checkMediaScript], {
      cwd: root,
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '請改用新檔名，例如 `.v2.mp4`（ARCHITECTURE §9.2）',
    );
  });

  it('allows update mode to add new media while excluding non-media files', async () => {
    const root = await createWorkspace('new clip', {
      'public/media/demo/deleted.mp4': sha256('deleted clip'),
    });
    await writeFile(join(root, 'public', 'media', 'README.txt'), 'ignore me');

    expect(await verifyMediaManifest(root)).toMatchObject({
      added: ['public/media/demo/clip.mp4'],
      removed: ['public/media/demo/deleted.mp4'],
    });
    await verifyMediaManifest(root, { update: true });

    const manifest = JSON.parse(
      await readFile(join(root, 'scripts', 'media-manifest.json'), 'utf8'),
    );
    expect(manifest).toEqual({
      'public/media/demo/clip.mp4': sha256('new clip'),
    });
  });

  it('never changes an existing hash in update mode', async () => {
    const oldHash = sha256('old bytes');
    const root = await createWorkspace('replacement bytes', {
      'public/media/demo/clip.mp4': oldHash,
    });

    expect((await verifyMediaManifest(root, { update: true })).changed).toEqual(
      ['public/media/demo/clip.mp4'],
    );
    const manifest = JSON.parse(
      await readFile(join(root, 'scripts', 'media-manifest.json'), 'utf8'),
    );
    expect(manifest['public/media/demo/clip.mp4']).toBe(oldHash);
  });
});
