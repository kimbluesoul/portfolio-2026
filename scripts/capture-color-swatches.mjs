/* global document */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const outputDirectory = join(
  process.cwd(),
  'docs',
  'screenshots',
  '88win',
  'color-swatches',
);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const viewports = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 900 },
  { name: '390', width: 390, height: 844 },
];

for (const viewport of viewports) {
  const page = await browser.newPage({
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    viewport: { width: viewport.width, height: viewport.height },
  });
  await page.goto('http://127.0.0.1:4321/work/88win/', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  const swatches = page.locator('.color-swatches');
  await swatches.scrollIntoViewIfNeeded();
  await swatches.screenshot({
    path: join(outputDirectory, `${viewport.name}@2x.png`),
  });
  await page.close();
}

await browser.close();
process.stdout.write(
  `Captured ${viewports.length} 2× color-swatch screenshots.\n`,
);
