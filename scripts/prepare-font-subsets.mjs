import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const generatedDirectory = join(root, 'public', '_fonts');
const generatedCss = join(root, 'src', 'styles', 'noto-sans-tc.generated.css');

await rm(generatedDirectory, { recursive: true, force: true });
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  generatedCss,
  '/* Generated during the two-pass ADR-0012 build. */\n',
  'utf8',
);

process.stdout.write('Prepared an empty first-pass CJK font stylesheet.\n');
