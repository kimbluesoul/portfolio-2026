/* global document */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const outputDirectory = join(process.cwd(), 'docs', 'screenshots', '88win');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const sections = [
  { name: '01-hero', selector: '.case-hero' },
  { name: '02-overview', selector: '.overview' },
  { name: '03-key-screens', selector: '.key-screens' },
  { name: '04-mobile', selector: '.mobile-rwd' },
  { name: '05-motion', selector: '.interaction-motion' },
  { name: '06-details', selector: '.details' },
  { name: '07-visual-extension', selector: '.visual-extension' },
  { name: '08-links', selector: '.case-links' },
  { name: '09-next', selector: '.next-project' },
];
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const viewport of viewports) {
  const page = await browser.newPage({
    bypassCSP: true,
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  await page.goto('http://127.0.0.1:4321/work/88win/', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: '.site-header, .skip-link { display: none !important; }',
  });
  for (const section of sections) {
    await page.locator(section.selector).screenshot({
      path: join(outputDirectory, `${section.name}-${viewport.name}.jpg`),
      type: 'jpeg',
      quality: 90,
    });
  }
  await page.close();
}

await browser.close();
process.stdout.write(
  `Captured ${sections.length * viewports.length} M2 88Win section screenshots.\n`,
);
