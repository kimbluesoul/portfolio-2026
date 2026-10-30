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
    // axe must judge the settled design, not text mid-way through a reveal
    // fade (half-opacity text fails contrast). Reduced motion skips reveals.
    await page.emulateMedia({ reducedMotion: 'reduce' });

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

test('header tap targets are at least 44 × 44 px at 390 px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const misses = await page.evaluate(() => {
    const minimum = 44;
    const failures: string[] = [];
    for (const link of document.querySelectorAll<HTMLAnchorElement>(
      '.site-header a',
    )) {
      const box = link.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      // Probe just inside the edges of a 44 px box centred on the link.
      const probes = [
        [centerX, centerY - minimum / 2 + 1],
        [centerX, centerY + minimum / 2 - 1],
        [centerX - minimum / 2 + 1, centerY],
        [centerX + minimum / 2 - 1, centerY],
      ];
      const hit = probes.every(([x, y]) =>
        link.contains(document.elementFromPoint(x ?? 0, y ?? 0)),
      );
      if (!hit) failures.push(link.getAttribute('href') ?? '?');
    }
    return failures;
  });
  expect(misses).toEqual([]);
});

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

test('home uses the approved copy, links, and card assets', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('header img[alt="Syuan Ci"]')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Work', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('HELLO, I’M SYUAN CI')).toBeVisible();
  await expect(
    page.getByText(
      '專注於介面設計、互動與動態視覺，將靜態畫面延伸成清晰、直覺且富有節奏的數位體驗。',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText('精選作品', { exact: true })).toHaveCount(0);

  const credentials = page.locator('.credentials li');
  await expect(credentials).toHaveCount(3);
  await expect(credentials.nth(0)).toContainText(
    /EXPERIENCE\s*6 年以上 UI 與數位介面設計/u,
  );
  await expect(credentials.nth(1)).toContainText(
    /FOCUS\s*介面設計・互動設計・動態設計・原型設計/u,
  );
  await expect(credentials.nth(2)).toContainText(
    /CURRENTLY\s*Available for opportunities/u,
  );

  const cards = page.locator('#work article');
  const expectedCardCopy = [
    ['01 — 88Win', '線上娛樂城', 'PC / H5 / App', '2025–2026'],
    ['02 — Hwa Fong Tire', '華豐輪胎', '品牌網站', '2024–2025'],
    ['03 — FITZONE', '健身房', 'Motion', '2024–2025'],
    ['04 — SSS', '超透明提案', '活動頁面', '2024–2025'],
    ['05 — JHANYU', '展裕建設', '品牌延伸', '2024–2025'],
    ['06 — AMD', '康健生醫', '互動設計', '2024–2025'],
    ['07 — HUIFA', '匯發營造', 'Motion', '2024–2025'],
  ];
  for (const [index, copy] of expectedCardCopy.entries()) {
    // textContent: copy fidelity must not depend on reveal (opacity) state.
    const text = (await cards.nth(index).textContent()) ?? '';
    for (const value of copy) expect(text).toContain(value);
  }
  await expect(page.locator('#work picture img')).toHaveCount(7);
  for (const image of await page.locator('#work picture img').all()) {
    await expect(image).toHaveAttribute('src', /\/_astro\/card\./u);
  }

  await expect(
    page.getByText('Thanks for scrolling.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Based in Taiwan, Feel free to get in touch.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute(
    'href',
    'mailto:kimbluesoul@gmail.com',
  );
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/syuanci-chou-design',
  );
  await expect(
    page.getByRole('link', { name: 'View Resume', exact: true }),
  ).toHaveAttribute('href', '/resume/');
  await expect(
    page.getByRole('link', { name: 'VIEW RESUME', exact: true }),
  ).toHaveAttribute('href', '/resume/');
});

test('home remains complete with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('reveal-on-view')).toHaveCount(7);
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#work article').last()).toBeVisible();
});

test('88Win renders the M2 case template and pending-media contract', async ({
  page,
}) => {
  await page.goto('/work/88win/');

  await expect(page.locator('.case-study > .case-section')).toHaveCount(9);
  await expect(page.getByText('素材待補', { exact: true })).toHaveCount(22);
  await expect(page.locator('loop-video')).toHaveCount(4);
  await expect(page.locator('loop-video video source')).toHaveCount(0);
  await expect(page.locator('motion-steps')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: '資訊很多，重點要先被看見' }),
  ).toBeVisible();
  await expect(
    page.getByText('正式網站因合約關係不便公開。', { exact: true }),
  ).toBeVisible();
});

test('motion steps support roving keyboard navigation', async ({ page }) => {
  await page.goto('/work/88win/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(
    page.getByRole('tabpanel', { name: /02 選擇廠商／遊戲/u }),
  ).toBeVisible();
});

test('resume links to the supplied PDF', async ({ page, request }) => {
  await page.goto('/resume/');
  await expect(
    page.getByRole('link', { name: 'Download PDF' }),
  ).toHaveAttribute('href', '/files/Syuan-Ci-Resume.pdf');
  const response = await request.get('/files/Syuan-Ci-Resume.pdf');
  expect(response.ok()).toBe(true);
});
