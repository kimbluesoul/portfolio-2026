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
  await expect(page.locator('#work loop-video')).toHaveCount(7);
  await expect(page.locator('#work loop-video video')).toHaveCount(8);
  await expect(
    page.locator('#work picture:has(> img.composite-background)'),
  ).toHaveCount(1);
  expect(
    await page
      .locator('#work article')
      .nth(1)
      .locator('video source')
      .evaluate(
        (source) =>
          source.getAttribute('src') ?? source.getAttribute('data-src'),
      ),
  ).toBe('/media/hwa-fong/card.mp4');

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
  await expect(page.getByText('素材待補', { exact: true })).toHaveCount(19);
  await expect(page.locator('loop-video')).toHaveCount(5);
  await expect(page.locator('loop-video video source[src]')).toHaveCount(0);
  await expect(page.locator('motion-steps')).toHaveCount(1);
  await expect(page.locator('.detail-card')).toHaveCount(7);
  await expect(page.locator('.detail-card picture')).toHaveCount(7);
  await expect(
    page.locator('.detail-card source[media="(width < 48rem)"]'),
  ).toHaveCount(14);
  await expect(page.locator('.case-hero .hero-showcase')).toHaveCount(1);
  await expect(
    page.locator('.visual-extension .visual-grid > .media-frame'),
  ).toHaveCount(1);
  await expect(
    page.locator('.story-title').filter({ hasText: '最難的地方' }),
  ).toBeVisible();
  await expect(page.getByText('已上線', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '資訊很多，重點要先被看見' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /H5／App 原型/u }),
  ).toHaveAttribute('href', /node-id=14925-16976/u);
  await expect(
    page.getByText(
      '以「DURO for Durability」為核心，呈現華豐輪胎可靠的品牌形象與完整產品線，並加入可探索的互動與 Motion。',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText('TODO(CONTENT)', { exact: true })).toHaveCount(0);
  await expect(
    page.getByText('正式網站因合約關係不便公開。', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.overview-heading h2 br')).toHaveCount(1);
  await expect(page.getByText('NEXT PROJECT 02 / 07')).toBeVisible();
});

const stubMediaPlayback = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_FUTURE_DATA,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value(this: HTMLMediaElement) {
        this.dispatchEvent(new Event('canplay'));
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value(this: HTMLMediaElement) {
        const count = Number(this.dataset.testPlayCount ?? '0') + 1;
        this.dataset.testPlayCount = String(count);
        return Promise.resolve();
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value() {},
    });
  });
};

test('loop video lazy-loads, plays once in view, and ends without looping', async ({
  page,
}) => {
  await stubMediaPlayback(page);
  await page.goto('/');

  const card = page.locator('#work article').last();
  const player = card.locator('loop-video');
  const video = player.locator('video');
  const source = video.locator('source');
  await expect(source).not.toHaveAttribute('src', /.+/u);

  await card.scrollIntoViewIfNeeded();
  await expect(source).toHaveAttribute('src', '/media/huifa/card.mp4');
  await expect(player).toHaveAttribute('data-state', 'playing');
  expect(await video.evaluate((node) => (node as HTMLVideoElement).loop)).toBe(
    false,
  );

  await video.evaluate((node) => node.dispatchEvent(new Event('ended')));
  await expect(player).toHaveAttribute('data-state', 'ended');
  await expect(video).toHaveAttribute('data-test-play-count', '1');
});

test('reduced motion keeps scroll playback idle but still allows hover replay', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Fine-pointer behavior.',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stubMediaPlayback(page);
  await page.goto('/');

  const card = page.locator('#work article').last();
  const player = card.locator('loop-video');
  const video = player.locator('video');
  await card.scrollIntoViewIfNeeded();
  await expect(video.locator('source')).toHaveAttribute(
    'src',
    '/media/huifa/card.mp4',
  );
  await expect(player).toHaveAttribute('data-state', 'idle');
  await expect(video).not.toHaveAttribute('data-test-play-count', /.+/u);

  await card.locator('a').hover();
  await expect(player).toHaveAttribute('data-state', 'playing');
  await expect(video).toHaveAttribute('data-test-play-count', '1');
});

test('Save-Data prevents playback on entry', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
  });
  await stubMediaPlayback(page);
  await page.goto('/');

  const card = page.locator('#work article').last();
  const player = card.locator('loop-video');
  await card.scrollIntoViewIfNeeded();
  await expect(player.locator('source')).toHaveAttribute(
    'src',
    '/media/huifa/card.mp4',
  );
  await expect(player).toHaveAttribute('data-state', 'idle');
  await expect(player.locator('video')).not.toHaveAttribute(
    'data-test-play-count',
    /.+/u,
  );
});

test('fine-pointer hover replays from the beginning', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Fine-pointer behavior.',
  );
  await stubMediaPlayback(page);
  await page.goto('/');

  const card = page.locator('#work article').last();
  const player = card.locator('loop-video');
  const video = player.locator('video');
  await card.scrollIntoViewIfNeeded();
  await expect(player).toHaveAttribute('data-state', 'playing');
  await video.evaluate((node) => {
    (node as HTMLVideoElement).currentTime = 4;
  });

  await card.locator('a').hover();
  await expect(video).toHaveAttribute('data-test-play-count', '2');
  expect(
    await video.evaluate((node) => (node as HTMLVideoElement).currentTime),
  ).toBe(0);
});

test('tapping a card video follows its link instead of replaying', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Touch-only behavior.');
  await stubMediaPlayback(page);
  await page.goto('/');

  const card = page.locator('#work article').first();
  await card.locator('.media').tap();
  await expect(page).toHaveURL(/\/work\/88win\/$/u);
});

test('case swipe rows match the mobile Figma widths', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.goto('/work/88win/');

  const closeups = page.getByRole('region', { name: '主要畫面特寫' });
  const devices = page.getByRole('region', { name: '手機畫面' });
  await expect(closeups).toHaveCSS('scroll-snap-type', 'x mandatory');
  await expect(devices).toHaveCSS('scroll-snap-type', 'x mandatory');
  for (const row of [closeups, devices]) {
    const rowBox = await row.boundingBox();
    const firstBox = await row.locator('figure').first().boundingBox();
    expect(rowBox).not.toBeNull();
    expect(firstBox).not.toBeNull();
    expect(rowBox?.x).toBe(0);
    expect(rowBox?.width).toBe(390);
    expect(firstBox?.x).toBe(20);
  }
  expect(
    await closeups
      .locator('figure')
      .first()
      .evaluate((node) => node.clientWidth),
  ).toBe(280);
  expect(
    await devices
      .locator('figure')
      .first()
      .evaluate((node) => node.clientWidth),
  ).toBe(250);
});

test('390 case hero and next project match the mobile Figma geometry', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.goto('/work/88win/');

  const hero = page.locator('.case-hero');
  const backLink = hero.locator('.back-link');
  const headline = hero.locator('.hero-headline');
  const stats = hero.locator('.hero-stats');
  const showcase = hero.locator('.hero-showcase .media-frame');
  const heroBox = await hero.boundingBox();
  const backBox = await backLink.boundingBox();
  const statsBox = await stats.boundingBox();
  const showcaseBox = await showcase.boundingBox();

  expect(heroBox?.height).toBeCloseTo(784, 0);
  expect((backBox?.x ?? 0) + (backBox?.width ?? 0) / 2).toBeCloseTo(195, 0);
  expect(
    await headline.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  expect(statsBox?.height).toBe(110);
  expect(showcaseBox).toMatchObject({ x: 0, width: 390, height: 312 });

  for (const value of await stats.locator('dd').all()) {
    expect(
      await value.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
  }

  const firstDetail = page.locator('.detail-card').first();
  const detailBox = await firstDetail.boundingBox();
  const detailMediaBox = await firstDetail
    .locator('.media-frame')
    .boundingBox();
  expect((detailMediaBox?.x ?? 0) - (detailBox?.x ?? 0)).toBe(20);
  expect(
    (detailBox?.x ?? 0) +
      (detailBox?.width ?? 0) -
      ((detailMediaBox?.x ?? 0) + (detailMediaBox?.width ?? 0)),
  ).toBe(20);

  const next = page.locator('.next-project');
  const nextBox = await next.boundingBox();
  const nextHeadingBox = await next.locator('.next-heading').boundingBox();
  const nextArrowBox = await next.locator('.next-arrow').boundingBox();
  const nextPreviewBox = await next.locator('.next-preview').boundingBox();
  const nextMeta = next.locator('.next-meta');
  expect(nextBox?.height).toBeCloseTo(530, 0);
  expect(nextArrowBox?.width).toBe(64);
  expect(nextArrowBox?.height).toBe(64);
  expect(nextArrowBox?.y).toBeGreaterThanOrEqual(nextHeadingBox?.y ?? 0);
  expect(
    (nextArrowBox?.y ?? 0) + (nextArrowBox?.height ?? 0),
  ).toBeLessThanOrEqual(
    (nextHeadingBox?.y ?? 0) + (nextHeadingBox?.height ?? 0),
  );
  expect(nextPreviewBox?.width).toBe(350);
  expect(nextPreviewBox?.height).toBeCloseTo(180, 0);
  expect(
    await nextMeta.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
});

test('360 case hero and next project stay within their containers', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/work/88win/');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth === window.innerWidth,
    ),
  ).toBe(true);

  for (const selector of [
    '.case-hero .case-container',
    '.next-project .case-container',
  ]) {
    const failures = await page.locator(selector).evaluate((container) => {
      const tolerance = 2;
      const bounds = container.getBoundingClientRect();
      return Array.from(container.children)
        .map((child) => child.getBoundingClientRect())
        .filter(
          (child) =>
            child.left < bounds.left - tolerance ||
            child.right > bounds.right + tolerance,
        ).length;
    });
    expect(failures).toBe(0);
  }
});

test('1920 case headings and stats stay on one line', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Desktop-only layout.',
  );
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/work/88win/');

  for (const locator of [
    page.locator('.hero-headline'),
    page.locator('.hero-stats dd').nth(0),
    page.locator('.hero-stats dd').nth(1),
    page.locator('.next-project h2'),
  ]) {
    await expect(locator).toHaveCSS('white-space', 'nowrap');
    expect(
      await locator.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
  }

  await expect(page.locator('.next-project h2')).toHaveCSS(
    'letter-spacing',
    '-6.56px',
  );

  const motionStage = await page.locator('.motion-stage').boundingBox();
  const motionTimeline = await page.locator('.motion-tabs').boundingBox();
  const nextPreview = await page.locator('.next-preview').boundingBox();
  expect(motionStage).toMatchObject({ x: 240, width: 960, height: 532 });
  expect(motionTimeline?.x).toBe(1280);
  expect(nextPreview?.width).toBe(1440);
  expect(nextPreview?.height).toBe(741);
});

test('home preserves the explicit Figma heading breaks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-heading br')).toHaveCount(1);
  await expect(page.locator('#about-heading br')).toHaveCount(1);
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
