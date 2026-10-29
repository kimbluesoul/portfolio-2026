import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/work/88win/', '/resume/', '/404/'];

for (const route of routes) {
  test(`${route} renders one h1 and passes the axe baseline`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );
    expect(blocking).toEqual([]);
  });
}

test('navigation exposes the public anchor contract', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Work' })).toHaveAttribute(
    'href',
    '/#work',
  );
  await expect(page.getByRole('link', { name: 'About' })).toHaveAttribute(
    'href',
    '/#about',
  );
  await expect(page.getByRole('link', { name: 'Contact' })).toHaveAttribute(
    'href',
    '#contact',
  );
  await expect(page.locator('#work')).toHaveCount(1);
  await expect(page.locator('#about')).toHaveCount(1);
  await expect(page.locator('#contact')).toHaveCount(1);
});

test('resume links to the supplied PDF', async ({ page, request }) => {
  await page.goto('/resume/');
  await expect(
    page.getByRole('link', { name: 'Download PDF' }),
  ).toHaveAttribute('href', '/files/Syuan-Ci-Resume.pdf');
  const response = await request.get('/files/Syuan-Ci-Resume.pdf');
  expect(response.ok()).toBe(true);
});
