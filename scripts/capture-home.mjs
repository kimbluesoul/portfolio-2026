/* global document */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const outputDirectory = join(process.cwd(), 'docs', 'screenshots');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const captures = [
  { name: 'm1-home-desktop.png', width: 1920, height: 1080 },
  { name: 'm1-home-mobile.png', width: 390, height: 844 },
];

for (const capture of captures) {
  const page = await browser.newPage({
    viewport: { width: capture.width, height: capture.height },
    reducedMotion: 'reduce',
  });
  await page.goto('http://127.0.0.1:4321/', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: join(outputDirectory, capture.name),
    fullPage: true,
  });
  await page.close();
}

await browser.close();
process.stdout.write(`Captured ${captures.length} M1 home screenshots.\n`);
