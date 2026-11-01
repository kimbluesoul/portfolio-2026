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

    // Reduced motion must start no CSS transitions, or axe reads colours
    // mid-fade (WebKit faded text in from the UA default black on load).
    const runningTransitions = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map(
          (transition) =>
            `${(transition as CSSTransition).transitionProperty} on ${
              (transition.effect as KeyframeEffect | null)?.target?.nodeName
            }`,
        ),
    );
    expect(runningTransitions).toEqual([]);

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

test('home starts no media requests before load', async ({ page }) => {
  let didLoad = false;
  const mediaRequestsBeforeLoad: string[] = [];
  page.on('load', () => {
    didLoad = true;
  });
  page.on('request', (request) => {
    if (!didLoad && new URL(request.url()).pathname.startsWith('/media/')) {
      mediaRequestsBeforeLoad.push(request.url());
    }
  });

  await page.goto('/');

  expect(mediaRequestsBeforeLoad).toEqual([]);
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
  await expect(backLink).toHaveCSS('justify-self', 'center');
  expect((backBox?.x ?? 0) + (backBox?.width ?? 0) / 2).toBeCloseTo(195, 0);
  await expect(hero.locator('h1')).toHaveCSS('font-size', '76px');
  await expect(hero.locator('h1')).toHaveCSS('letter-spacing', '-3.04px');
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
  // Content-driven height (no fixed min-height); same tolerance as the
  // per-section gate below.
  expect(Math.abs((nextBox?.height ?? 0) - 530)).toBeLessThanOrEqual(8);
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

test('360 home and case pages have no horizontal overflow', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ['/', '/work/88win/', '/work/fitzone/']) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === window.innerWidth,
      ),
      `${route} should not overflow horizontally`,
    ).toBe(true);
  }

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

// 390 section heights from each project's own Figma frame. Heights come from
// spacing and typography, never from a fixed min-height, so every project is
// gated against its own frame. ±8 px allows for text wrapping differences;
// Details allows ±16 px because its seven cards each round by about 2 px.
const figmaSectionHeights390 = {
  // 88Win `475:953`.
  '/work/88win/': [
    ['Hero', 784],
    ['Overview', 791],
    ['Key Screens', 740],
    ['Mobile / RWD', 717],
    ['Interaction & Motion', 792],
    ['Details', 3461, 16],
    ['Visual Extension', 410],
    ['Links', 659],
    ['Next Project', 530],
  ],
  // Hwa Fong `483:1298`.
  '/work/hwa-fong/': [
    ['Hero', 846],
    ['Overview', 765],
    ['Key Screens', 807],
    ['Interaction & Motion', 815],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 469],
  ],
  // FITZONE `484:1339`.
  '/work/fitzone/': [
    ['Hero', 810],
    ['Overview', 765],
    ['Key Screens', 760],
    ['Interaction & Motion', 789],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 490],
  ],
} as const;

for (const [route, expectedSections] of Object.entries(
  figmaSectionHeights390,
)) {
  test(`390 ${route} sections match their Figma frame heights`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    const actualHeights = await page
      .locator('.case-study > .case-section')
      .evaluateAll((sections) =>
        sections.map((section) => section.getBoundingClientRect().height),
      );

    expect(actualHeights).toHaveLength(expectedSections.length);
    for (const [index, section] of expectedSections.entries()) {
      const [name, expectedHeight, tolerance = 8] = section as readonly [
        string,
        number,
        number?,
      ];
      const actualHeight = actualHeights[index] ?? Number.NaN;
      expect(
        Math.abs(actualHeight - expectedHeight),
        `${name}: expected ${expectedHeight} ±${tolerance} px, received ${actualHeight}`,
      ).toBeLessThanOrEqual(tolerance);
    }
  });
}

test('390 Hwa Fong uses its project title size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/hwa-fong/');
  const title = page.locator('.case-hero h1');
  await expect(title).toHaveCSS('font-size', '56px');
  await expect(title).toHaveCSS('letter-spacing', '-2.24px');
});

// #33: Links cards (465:716 / 476:1906) and the Next row (360:1590 / 476:1929).
test('link cards and the Next row keep the Figma geometry', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs every width in one project.',
  );
  // Text boxes, not element boxes: the eyebrow and title span the card width.
  const textRect = (selector: string) =>
    page.locator(selector).evaluateAll((elements) =>
      elements.map((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const { left, right, top, bottom } = range.getBoundingClientRect();
        return { left, right, top, bottom };
      }),
    );
  type Rect = { left: number; right: number; top: number; bottom: number };
  const intersects = (a: Rect, b: Rect) =>
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;

  // 88Win has the longest eyebrow (`H5／APP PROTOTYPE`); 2-column cards are
  // narrowest just above 768.
  for (const width of [768, 800, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/88win/');
    const arrows = await textRect('.link-arrow');
    const eyebrows = await textRect('a.link-card .link-eyebrow');
    const titles = await textRect('a.link-card strong');
    expect(arrows.length).toBeGreaterThan(0);
    arrows.forEach((arrow, index) => {
      expect(intersects(arrow, eyebrows[index]!), `${width} eyebrow`).toBe(
        false,
      );
      expect(intersects(arrow, titles[index]!), `${width} title`).toBe(false);
    });
  }

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/work/88win/');
  const x = async (selector: string) =>
    (await page.locator(selector).first().boundingBox())?.x ?? 0;
  expect(await x('.next-topline .back-link')).toBeCloseTo(240, 0);
  expect(Math.abs((await x('.next-divider')) - 348)).toBeLessThanOrEqual(1.5);
  expect(
    Math.abs((await x('.next-topline .case-eyebrow')) - 373),
  ).toBeLessThanOrEqual(1.5);
  expect(Math.abs((await x('.next-counter')) - 523)).toBeLessThanOrEqual(1.5);
  const card = await page.locator('a.link-card').first().boundingBox();
  const arrow = await page.locator('.link-arrow').first().boundingBox();
  expect(card?.width).toBeCloseTo(704, 0);
  expect((arrow?.y ?? 0) - (card?.y ?? 0)).toBeCloseTo(40, 0);
  expect(
    (card?.x ?? 0) + (card?.width ?? 0) - (arrow?.x ?? 0) - (arrow?.width ?? 0),
  ).toBeCloseTo(60, 0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/88win/');
  const heights = await page
    .locator('.link-card')
    .evaluateAll((cards) =>
      cards.map((card) => card.getBoundingClientRect().height),
    );
  expect(Math.abs(heights[0]! - 177)).toBeLessThanOrEqual(2);
  expect(Math.abs(heights[1]! - 153)).toBeLessThanOrEqual(2);
});

// #27: an invalid clamp() in --line-height-body silently computed to `normal`.
test('case subtitles use the Figma line height, never normal', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs both widths in one project.',
  );
  // 1920: 20 / 160 % (360:251). 390: 15 / 170 % (475:953).
  for (const [width, expected] of [
    [1920, 32],
    [390, 25.5],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/88win/');
    const lineHeight = await page
      .locator('.section-subtitle')
      .first()
      .evaluate((element) => getComputedStyle(element).lineHeight);
    expect(lineHeight, `${width}`).not.toBe('normal');
    expect(Number.parseFloat(lineHeight), `${width}`).toBeCloseTo(expected, 0);
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

interface CdpNode {
  nodeId: number;
  nodeType: number;
  nodeName: string;
  nodeValue: string;
  attributes?: string[];
  children?: CdpNode[];
}

const elementNode = 1;
const textNode = 3;

// ADR-0012 amendment (2026-11-01): every rendered glyph is drawn with a
// self-hosted web font. A system font here means a CJK glyph missed its Noto
// Sans TC weight subset or a font stack lacks Noto Sans TC.
const platformFontRoutes = [
  '/',
  '/work/88win/',
  '/work/hwa-fong/',
  '/work/fitzone/',
  '/work/sss/',
  '/work/jhanyu/',
  '/work/amd/',
  '/work/huifa/',
  '/resume/',
  '/404/',
];

test('every text node renders with a self-hosted font', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'CSS.getPlatformFontsForNode is a Chromium DevTools Protocol method.',
  );
  test.setTimeout(120_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const fallbacks: string[] = [];

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of platformFontRoutes) {
      await page.goto(route, { waitUntil: 'load' });
      // `content-visibility: auto` skips layout off screen, and CDP then
      // reports no fonts for those nodes. Render everything, including the
      // inactive motion tab panels, then mark the nodes that still have no box
      // so an empty font list fails everywhere else.
      await page.evaluate(async () => {
        for (const element of document.querySelectorAll<HTMLElement>(
          'body *',
        )) {
          element.style.contentVisibility = 'visible';
        }
        for (const panel of document.querySelectorAll<HTMLElement>(
          '[role="tabpanel"][hidden]',
        )) {
          panel.hidden = false;
        }
        await new Promise(requestAnimationFrame);
        for (const element of document.querySelectorAll('body *')) {
          if (
            element.getClientRects().length === 0 ||
            getComputedStyle(element).visibility !== 'visible'
          ) {
            element.setAttribute('data-font-check-hidden', '');
          }
        }
        await document.fonts.ready;
      });
      const { root } = (await cdp.send('DOM.getDocument', {
        depth: -1,
      })) as { root: CdpNode };

      const textElements: {
        nodeId: number;
        label: string;
        text: string;
        hidden: boolean;
      }[] = [];
      const visit = (node: CdpNode) => {
        if (['HEAD', 'SCRIPT', 'STYLE', 'TEMPLATE'].includes(node.nodeName))
          return;
        const text = (node.children ?? [])
          .filter((child) => child.nodeType === textNode)
          .map((child) => child.nodeValue)
          .join('')
          .trim();
        if (node.nodeType === elementNode && text) {
          // CDP attributes are a flat [name, value, name, value, …] list.
          const attributes = node.attributes ?? [];
          const classIndex = attributes.findIndex(
            (value, index) => index % 2 === 0 && value === 'class',
          );
          const classes =
            classIndex >= 0
              ? (attributes[classIndex + 1] ?? '').split(/\s+/u).join('.')
              : '';
          textElements.push({
            nodeId: node.nodeId,
            label: `${node.nodeName.toLowerCase()}${classes ? `.${classes}` : ''}`,
            text,
            hidden: attributes.some(
              (value, index) =>
                index % 2 === 0 && value === 'data-font-check-hidden',
            ),
          });
        }
        for (const child of node.children ?? []) visit(child);
      };
      visit(root);

      for (const { nodeId, label, text, hidden } of textElements) {
        const { fonts } = (await cdp.send('CSS.getPlatformFontsForNode', {
          nodeId,
        })) as {
          fonts: { familyName: string; isCustomFont: boolean }[];
        };
        if (fonts.length === 0 && !hidden) {
          fallbacks.push(
            `${width} ${route} ${label} "${text.slice(0, 24)}": no font data`,
          );
        }
        const system = fonts.filter((font) => !font.isCustomFont);
        if (system.length > 0) {
          fallbacks.push(
            `${width} ${route} ${label} "${text.slice(0, 24)}": ${system
              .map((font) => font.familyName)
              .join(', ')}`,
          );
        }
      }
    }
  }

  expect(fallbacks, fallbacks.join('\n')).toEqual([]);
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
    page.getByRole('tabpanel', { name: /02\s選擇廠商／遊戲/u }),
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
