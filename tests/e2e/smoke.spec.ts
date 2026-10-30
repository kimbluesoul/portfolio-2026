import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const headersFile = readFileSync(
  new URL('../../public/_headers', import.meta.url),
  'utf8',
);
const productionCsp = headersFile.match(
  /^\s*Content-Security-Policy:\s*(.+)$/mu,
)?.[1];

if (!productionCsp) {
  throw new Error('public/_headers must define a Content-Security-Policy.');
}

const routes = ['/', '/work/88win/', '/resume/', '/404/'];

for (const route of routes) {
  test(`${route} applies production CSP and passes smoke checks`, async ({
    context,
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.addInitScript(() => {
      const cspViolations: string[] = [];
      Object.defineProperty(window, '__cspViolations', {
        value: cspViolations,
      });
      document.addEventListener('securitypolicyviolation', (event) => {
        cspViolations.push(
          `${event.effectiveDirective}: ${event.blockedURI || 'inline'}`,
        );
      });
    });

    await context.route('**/*', async (requestRoute) => {
      if (requestRoute.request().resourceType() !== 'document') {
        await requestRoute.continue();
        return;
      }

      const upstreamResponse = await requestRoute.fetch();
      const headers = upstreamResponse.headers();
      headers['content-security-policy'] = productionCsp;
      await requestRoute.fulfill({ response: upstreamResponse, headers });
    });

    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    expect(response?.headers()['content-security-policy']).toBe(productionCsp);
    await expect(page.locator('h1')).toHaveCount(1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );
    expect(blocking).toEqual([]);

    const cspViolations = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __cspViolations?: string[];
          }
        ).__cspViolations ?? [],
    );
    expect(consoleErrors).toEqual([]);
    expect(cspViolations).toEqual([]);
  });
}

test('navigation exposes the public anchor contract', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Work', exact: true }),
  ).toHaveAttribute('href', '/#work');
  await expect(
    page.getByRole('link', { name: 'About', exact: true }),
  ).toHaveAttribute('href', '/#about');
  await expect(
    page.getByRole('link', { name: 'Contact', exact: true }),
  ).toHaveAttribute('href', '#contact');
  await expect(page.locator('#work')).toHaveCount(1);
  await expect(page.locator('#about')).toHaveCount(1);
  await expect(page.locator('#contact')).toHaveCount(1);
});

test('home renders the complete ordered project index', async ({ page }) => {
  await page.goto('/');
  const projectLinks = page.locator('#work article > a');
  await expect(projectLinks).toHaveCount(7);
  expect(
    await projectLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    ),
  ).toEqual([
    '/work/88win/',
    '/work/hwa-fong/',
    '/work/fitzone/',
    '/work/sss/',
    '/work/jhanyu/',
    '/work/amd/',
    '/work/huifa/',
  ]);
});

test('home remains complete with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('reveal-on-view')).toHaveCount(8);
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#work article').last()).toBeVisible();
});

test('resume links to the supplied PDF', async ({ page, request }) => {
  await page.goto('/resume/');
  await expect(
    page.getByRole('link', { name: 'Download PDF' }),
  ).toHaveAttribute('href', '/files/Syuan-Ci-Resume.pdf');
  const response = await request.get('/files/Syuan-Ci-Resume.pdf');
  expect(response.ok()).toBe(true);
});
