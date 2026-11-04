import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

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

test('case Hero is visible before scrolling', async ({ page }) => {
  await page.goto('/work/88win/');

  const hero = page.locator('.case-hero');
  await expect(hero.locator('h1')).toBeVisible();
  await expect(hero.locator('.hero-headline')).toBeVisible();
  await expect(hero.locator('.hero-showcase')).toBeVisible();
  await expect(hero.locator('reveal-on-view')).toHaveCount(0);
});

test('a reveal group becomes completely visible in view', async ({ page }) => {
  await page.goto('/work/88win/');

  const group = page.locator('.link-cards').locator('..');
  await group.locator('.link-cards').evaluate((element) => {
    element.scrollIntoView({ block: 'center' });
  });
  await expect(group).toHaveAttribute('data-inview', '');
  await expect
    .poll(() =>
      group.locator('[data-reveal-item]').evaluateAll((items) =>
        items.every((item) => {
          const style = getComputedStyle(item);
          return style.opacity === '1' && style.transform === 'none';
        }),
      ),
    )
    .toBe(true);
});

test('reduced motion leaves no reveal content hidden', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/88win/');

  const hidden = await page.locator('reveal-on-view').evaluateAll((groups) =>
    groups.flatMap((group) => {
      const items = group.querySelectorAll('[data-reveal-item]');
      const targets =
        items.length > 0 ? Array.from(items) : [group.firstElementChild];
      return targets
        .filter((target): target is Element => target !== null)
        .filter((target) => {
          const style = getComputedStyle(target);
          return style.opacity !== '1' || style.transform !== 'none';
        });
    }),
  );
  expect(hidden).toEqual([]);
});

test('case reveal content stays visible without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: String(testInfo.project.use.baseURL),
  });
  const page = await context.newPage();
  await page.goto('/work/88win/');

  const hidden = await page.locator('reveal-on-view').evaluateAll((groups) =>
    groups.flatMap((group) => {
      const items = group.querySelectorAll('[data-reveal-item]');
      const targets =
        items.length > 0 ? Array.from(items) : [group.firstElementChild];
      return targets
        .filter((target): target is Element => target !== null)
        .filter((target) => getComputedStyle(target).opacity !== '1');
    }),
  );
  expect(hidden).toEqual([]);
  await context.close();
});

test('88Win renders the M2 case template and pending-media contract', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/88win/');

  await expect(page.locator('.case-study > .case-section')).toHaveCount(9);
  await expect(page.getByText('素材待補', { exact: true })).toHaveCount(0);
  await expect(page.locator('loop-video')).toHaveCount(7);
  await expect(page.locator('loop-video video source[src]')).toHaveCount(0);
  await expect(page.locator('motion-steps')).toHaveCount(1);
  await expect(page.locator('.detail-card')).toHaveCount(7);
  // Every image card renders <picture> (AVIF + webp); COLOR is HTML swatches.
  // All six show their desktop image on phones for now (docs/ASSETS.md).
  await expect(page.locator('.detail-card picture')).toHaveCount(6);
  await expect(
    page.locator('.detail-card source[media="(width < 48rem)"]'),
  ).toHaveCount(0);
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

test('88Win color swatches reflow, fill their frames, and keep every hex code as text', async ({
  page,
}) => {
  const hexCodes = ['#0B2240', '#0A6ABF', '#6AAAE2', '#BBCDEB', '#EFF8FF'];

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/work/88win/');
  const swatches = page.locator('.swatches-item');
  await swatches.first().scrollIntoViewIfNeeded();
  await expect(swatches).toHaveCount(5);
  for (const hex of hexCodes) {
    await expect(page.getByText(hex, { exact: true })).toBeVisible();
  }
  const desktopBoxes = await swatches.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect()),
  );
  expect(new Set(desktopBoxes.map(({ y }) => Math.round(y))).size).toBe(1);
  const desktopSwatches = await page
    .locator('.swatch-color')
    .evaluateAll((colors) =>
      colors.map((color) => {
        const frame = color.getBoundingClientRect();
        const rect = color.querySelector('rect')!.getBoundingClientRect();
        return {
          frame: { width: frame.width, height: frame.height },
          rect: { width: rect.width, height: rect.height },
          radius: getComputedStyle(color).borderTopLeftRadius,
          outline: {
            color: getComputedStyle(color).outlineColor,
            width: getComputedStyle(color).outlineWidth,
          },
        };
      }),
    );
  for (const { frame, rect, radius } of desktopSwatches) {
    expect(frame.width).toBeCloseTo(115, 1);
    expect(frame.height).toBeCloseTo(88, 1);
    expect(rect.width).toBeCloseTo(frame.width, 1);
    expect(rect.height).toBeCloseTo(frame.height, 1);
    expect(radius).toBe('12px');
  }
  expect(desktopSwatches.at(-1)?.outline).toEqual({
    color: 'rgb(224, 231, 241)',
    width: '1px',
  });

  for (const width of [1440, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await swatches.first().scrollIntoViewIfNeeded();
    const rowPositions = await swatches.evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().y)),
    );
    expect(new Set(rowPositions).size).toBe(1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await swatches.first().scrollIntoViewIfNeeded();
  const mobileBoxes = await swatches.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect()),
  );
  expect(new Set(mobileBoxes.map(({ x }) => Math.round(x))).size).toBe(1);
  for (let index = 1; index < mobileBoxes.length; index += 1) {
    expect(mobileBoxes[index]!.y).toBeGreaterThan(mobileBoxes[index - 1]!.y);
  }
  const mobileSwatches = await page
    .locator('.swatch-color')
    .evaluateAll((colors) =>
      colors.map((color) => ({
        radius: getComputedStyle(color).borderTopLeftRadius,
        outline: {
          color: getComputedStyle(color).outlineColor,
          width: getComputedStyle(color).outlineWidth,
        },
      })),
    );
  expect(mobileSwatches.every(({ radius }) => radius === '8px')).toBe(true);
  expect(mobileSwatches.at(-1)?.outline).toEqual({
    color: 'rgb(224, 231, 241)',
    width: '1px',
  });
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

test('hover scales each composite card layer together', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Fine-pointer behavior.',
  );
  await page.goto('/');

  const card = page
    .locator('#work article')
    .filter({ has: page.locator('.card-composite') });
  await card.scrollIntoViewIfNeeded();
  await card.locator('a').hover();

  const layerRects = await card
    .locator('.card-composite')
    .evaluateAll((composites) =>
      composites.map((composite) => {
        const rect = (selector: string) => {
          const { x, y, width, height } = composite
            .querySelector(selector)!
            .getBoundingClientRect();
          return { x, y, width, height };
        };
        return {
          desktop: {
            poster: rect('img.composite-poster.composite-pc'),
            video: rect('video.composite-pc'),
          },
          phone: {
            poster: rect('img.composite-poster.composite-phone'),
            video: rect('video.composite-phone'),
          },
        };
      }),
    );

  for (const { desktop, phone } of layerRects) {
    expect(desktop.video).toEqual(desktop.poster);
    expect(phone.video).toEqual(phone.poster);
  }
});

test('hover scales each single-video card poster and video together', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Fine-pointer behavior.',
  );
  await page.goto('/');

  const card = page
    .locator('#work article')
    .filter({ has: page.locator('.media-video') })
    .first();
  const media = card.locator('.media').first();
  await card.scrollIntoViewIfNeeded();
  await card.locator('a').hover();
  await expect
    .poll(async () => {
      const [mediaBox, wrapperBox] = await Promise.all([
        media.boundingBox(),
        card.locator('.media-video').first().boundingBox(),
      ]);
      return (wrapperBox?.width ?? 0) > (mediaBox?.width ?? 0);
    })
    .toBe(true);

  const { mediaRect, posterRect, videoRect } = await card
    .locator('.media-video')
    .first()
    .evaluate((wrapper) => {
      const rect = (element: Element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        mediaRect: rect(wrapper.parentElement!),
        posterRect: rect(wrapper.querySelector('img')!),
        videoRect: rect(wrapper.querySelector('video')!),
      };
    });

  expect(posterRect).toEqual(videoRect);
  expect(posterRect.width).toBeGreaterThan(mediaRect.width);
  expect(posterRect.height).toBeGreaterThan(mediaRect.height);
  await expect(media).toBeVisible();
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
  // `content-visibility: auto` keeps the placeholder size until the section
  // nears the viewport, so measure it where a visitor would see it. The
  // browser renders it in the frame after it scrolls into view.
  await next.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => (await next.boundingBox())?.height)
    .toBeLessThan(800);
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

test('desktop Details cards never clip their content', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Desktop-only layout.',
  );

  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/88win/');
    const sizes = await page.locator('.detail-card').evaluateAll((cards) => {
      for (const card of cards) {
        const section = card.closest<HTMLElement>('.case-section');
        if (section) section.style.contentVisibility = 'visible';
      }
      return cards.map((card) => ({
        clientHeight: card.clientHeight,
        scrollHeight: card.scrollHeight,
      }));
    });

    expect(sizes.length, `${width} detail cards`).toBeGreaterThan(0);
    for (const [index, { clientHeight, scrollHeight }] of sizes.entries()) {
      expect(scrollHeight, `${width} detail card ${index}`).toBeLessThanOrEqual(
        clientHeight,
      );
    }
  }
});

test('360 home and case pages have no horizontal overflow', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-iphone', 'Mobile-only layout.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
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

// iOS Safari fills the strip below the page from the root background and from
// fixed elements at the viewport edge. The footer is the last thing on the
// page, the root stays white at the top, and only once the footer covers the
// bottom edge do the root and the thin `footer-tint` bar take its color.
test('the footer color continues below the page only at the bottom', async ({
  page,
}) => {
  const state = () =>
    page.evaluate(() => {
      const root = document.documentElement;
      const footer = document.querySelector('.site-footer')!;
      const bar = document.querySelector('footer-tint')!;
      const footerBox = footer.getBoundingClientRect();
      const barBox = bar.getBoundingClientRect();
      return {
        tint: root.hasAttribute('data-footer-tint'),
        rootBg: getComputedStyle(root).backgroundColor,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        footerBg: getComputedStyle(footer).backgroundColor,
        barDisplay: getComputedStyle(bar).display,
        barPosition: getComputedStyle(bar).position,
        barBg: getComputedStyle(bar).backgroundColor,
        barTop: barBox.top,
        barBottom: barBox.bottom,
        barWidth: barBox.width,
        footerTop: footerBox.top,
        footerBottom: footerBox.bottom + window.scrollY,
        scrollHeight: root.scrollHeight,
        scrollWidth: root.scrollWidth,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      };
    });

  for (const route of ['/', '/work/88win/', '/resume/']) {
    await page.goto(route);
    const top = await state();
    expect(top.tint, `${route} top`).toBe(false);
    expect(top.rootBg, `${route} top root`).toBe(top.bodyBg);
    expect(top.barDisplay, `${route} top bar`).toBe('none');

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect.poll(async () => (await state()).tint).toBe(true);
    const bottom = await state();
    expect(bottom.rootBg, `${route} bottom root`).toBe(bottom.footerBg);
    expect(bottom.barPosition).toBe('fixed');
    expect(bottom.barBg).toBe(bottom.footerBg);
    expect(bottom.barBottom).toBeCloseTo(bottom.innerHeight, 0);
    expect(bottom.barWidth).toBe(bottom.innerWidth);
    // The bar sits over the footer, never over the white page above it.
    expect(bottom.barTop).toBeGreaterThanOrEqual(bottom.footerTop);
    // Measured at the bottom: `content-visibility` placeholders above settle
    // while scrolling. The footer still ends the page, so the bar adds no
    // scroll height, and nothing overflows sideways.
    expect(bottom.footerBottom, `${route} footer ends the page`).toBeCloseTo(
      bottom.scrollHeight,
      0,
    );
    expect(bottom.scrollWidth, `${route} no horizontal overflow`).toBe(
      bottom.innerWidth,
    );

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => (await state()).tint).toBe(false);
    expect((await state()).barDisplay).toBe('none');
  }
});

// Every route, including case pages that still hold placeholder content, at
// the minimum width (§10) and at the undesigned tablet / small-desktop widths.
const projectSlugs = readdirSync(
  new URL('../../src/content/projects/', import.meta.url),
)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/u, ''));

test('390 HUIFA Visual Extension uses its mobile source exclusively', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs every project in one mobile viewport.',
  );
  await page.setViewportSize({ width: 390, height: 844 });

  for (const slug of projectSlugs) {
    await page.goto(`/work/${slug}/`);
    const frame = page
      .locator('.visual-extension .variant-mosaic .media-frame')
      .first();
    const mobileSources = frame.locator('source[media="(width < 48rem)"]');

    if (slug === 'huifa') {
      await expect(frame).toHaveClass(/\bhas-mobile-art\b/u);
      await expect(mobileSources).toHaveCount(2);
      await frame.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          frame
            .locator('img')
            .evaluate((image: HTMLImageElement) => image.currentSrc),
        )
        .toContain('visual-mosaic-mobile');
    } else {
      await expect(frame).not.toHaveClass(/\bhas-mobile-art\b/u);
      await expect(mobileSources, `${slug} mobile sources`).toHaveCount(0);
    }
  }
});

test('Visual Extension mosaics fill their frames without the placeholder tone', async ({
  browser,
}, testInfo) => {
  const isDesktop = testInfo.project.name === 'chromium-desktop';
  const isMobile = testInfo.project.name === 'webkit-iphone';
  test.skip(!isDesktop && !isMobile, 'Desktop and iPhone layout coverage.');

  const context = await browser.newContext({
    viewport: {
      width: isDesktop ? 1536 : 390,
      height: isDesktop ? 730 : 844,
    },
    ...(isDesktop && { deviceScaleFactor: 1.25 }),
  });
  const page = await context.newPage();

  try {
    if (isDesktop) {
      expect(await page.evaluate(() => window.devicePixelRatio)).toBe(1.25);
    }

    for (const slug of projectSlugs) {
      await page.goto(`/work/${slug}/`);
      const mosaics = page.locator(
        '.visual-extension .variant-mosaic .media-frame',
      );
      expect(await mosaics.count(), `${slug} mosaic`).toBeGreaterThan(0);

      const geometry = await mosaics.evaluateAll((frames) =>
        frames.map((frame) => {
          const image = frame.querySelector<HTMLImageElement>('img');
          const frameRect = frame.getBoundingClientRect();
          const imageRect = image?.getBoundingClientRect();
          return {
            background: getComputedStyle(frame).backgroundColor,
            frame: {
              x: frameRect.x,
              y: frameRect.y,
              width: frameRect.width,
              height: frameRect.height,
            },
            image: imageRect && {
              x: imageRect.x,
              y: imageRect.y,
              width: imageRect.width,
              height: imageRect.height,
            },
          };
        }),
      );

      for (const { background, frame, image } of geometry) {
        expect(background, `${slug} mosaic frame background`).not.toBe(
          'rgb(230, 230, 230)',
        );
        expect(image, `${slug} mosaic image`).toBeTruthy();
        for (const edge of ['x', 'y'] as const) {
          expect(
            (image?.[edge] ?? Number.NaN) - frame[edge],
            `${slug} mosaic ${edge}`,
          ).toBeLessThanOrEqual(0.01);
        }
        expect(
          (image?.x ?? Number.NaN) +
            (image?.width ?? Number.NaN) -
            (frame.x + frame.width),
          `${slug} mosaic right edge`,
        ).toBeGreaterThanOrEqual(-0.01);
        expect(
          (image?.y ?? Number.NaN) +
            (image?.height ?? Number.NaN) -
            (frame.y + frame.height),
          `${slug} mosaic bottom edge`,
        ).toBeGreaterThanOrEqual(-0.01);
      }
    }
  } finally {
    await context.close();
  }
});

test('mosaics have no bright or dark viewport boundary rows', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Chromium pixels only.',
  );
  for (const config of [
    { width: 1920, height: 911, dpr: 1 },
    { width: 1536, height: 730, dpr: 1.25 },
    { width: 1280, height: 600, dpr: 1.5 },
    { width: 1024, height: 768, dpr: 1 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      deviceScaleFactor: config.dpr,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    try {
      for (const slug of projectSlugs) {
        await page.goto(`/work/${slug}/`);
        const frame = page.locator(
          '.visual-extension .variant-mosaic .media-frame',
        );
        for (const edge of ['top', 'bottom'] as const) {
          const edgeY = await frame.evaluate(async (element, edgeName) => {
            const rect = element.getBoundingClientRect();
            const edge = edgeName === 'top' ? rect.top : rect.bottom;
            window.scrollTo({
              top: scrollY + edge - innerHeight / 2,
              behavior: 'instant',
            });
            await new Promise(requestAnimationFrame);
            await Promise.all(
              [...element.querySelectorAll<HTMLImageElement>('img')].map(
                async (image) => {
                  if (!image.complete || image.naturalWidth === 0) {
                    await new Promise<void>((resolve) =>
                      image.addEventListener('load', () => resolve(), {
                        once: true,
                      }),
                    );
                  }
                  await image.decode().catch(() => undefined);
                },
              ),
            );
            const settled = element.getBoundingClientRect();
            return edgeName === 'top' ? settled.top : settled.bottom;
          }, edge);
          const clipY = Math.max(
            0,
            Math.min(config.height - 9, Math.floor(edgeY) - 4),
          );
          const screenshot = await page.screenshot({
            clip: { x: 0, y: clipY, width: config.width, height: 9 },
          });
          const seams = await page.evaluate(
            async ({ encoded, edges }) => {
              const image = new Image();
              image.src = `data:image/png;base64,${encoded}`;
              await image.decode();
              const canvas = document.createElement('canvas');
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const context = canvas.getContext('2d', {
                willReadFrequently: true,
              });
              if (!context) throw new Error('2D canvas unavailable.');
              context.drawImage(image, 0, 0);
              const data = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              ).data;
              const scale = image.naturalWidth / innerWidth;
              const mean = (row: number) => {
                let total = 0;
                for (let column = 0; column < canvas.width; column += 1) {
                  const offset = (row * canvas.width + column) * 4;
                  total +=
                    (data[offset]! + data[offset + 1]! + data[offset + 2]!) / 3;
                }
                return total / canvas.width;
              };
              const rows: number[] = [];
              for (const edge of edges) {
                const center = Math.round(edge * scale);
                for (
                  let row = Math.max(1, center - Math.ceil(4 * scale));
                  row <=
                  Math.min(canvas.height - 2, center + Math.ceil(4 * scale));
                  row += 1
                ) {
                  const value = mean(row);
                  if (
                    (value > mean(row - 1) + 4 && value > mean(row + 1) + 4) ||
                    (value < mean(row - 1) - 4 && value < mean(row + 1) - 4)
                  )
                    rows.push(row);
                }
              }
              return rows;
            },
            { encoded: screenshot.toString('base64'), edges: [4] },
          );
          expect(
            seams,
            `${slug} ${edge} ${config.width} DPR ${config.dpr}`,
          ).toEqual([]);
        }
      }
    } finally {
      await context.close();
    }
  }
});

const overflowRoutes = [
  '/',
  ...projectSlugs.map((slug) => `/work/${slug}/`),
  '/resume/',
  '/404/',
];

for (const width of [360, 768, 1024]) {
  test(`${width} every route has no horizontal overflow`, async ({ page }) => {
    expect(projectSlugs).toHaveLength(7);
    await page.setViewportSize({ width, height: 800 });
    for (const route of overflowRoutes) {
      await page.goto(route);
      const overflow = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth <= viewport) return null;
        // Name the widest offender so a failure points at the cause. Children
        // of a clipping box (e.g. the cropped hero showcase) are not causes.
        // `body`'s own overflow-x applies to the viewport, so stop below it.
        const isClipped = (node: Element) => {
          for (
            let up = node.parentElement;
            up && up !== document.body;
            up = up.parentElement
          ) {
            if (getComputedStyle(up).overflowX !== 'visible') return true;
          }
          return false;
        };
        const culprit = Array.from(document.querySelectorAll('body *'))
          .filter(
            (node) =>
              node.getBoundingClientRect().right > viewport + 1 &&
              !isClipped(node),
          )
          .sort(
            (a, b) =>
              b.getBoundingClientRect().right - a.getBoundingClientRect().right,
          )[0];
        return `${document.documentElement.scrollWidth}px, widest: ${
          culprit
            ? `${culprit.tagName.toLowerCase()}.${culprit.className}`
            : '?'
        }`;
      });
      expect(overflow, `${route} at ${width}px`).toBeNull();
    }
  });
}

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
    // PO 2026-11-03: phones keep the desktop Details images (no mobile
    // exports), so this is the site's own height, not Figma's 3461.
    ['Details', 2664, 16],
    ['Visual Extension', 410],
    ['Links', 659],
    ['Next Project', 530],
  ],
  // Hwa Fong `483:1298`.
  '/work/hwa-fong/': [
    ['Hero', 846],
    ['Overview', 765],
    ['Key Screens', 807],
    // Flatter 2528 / 1216 motion videos (PO 2026-11-03), not Figma's 815.
    ['Interaction & Motion', 787],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 469],
  ],
  // FITZONE `484:1339`.
  '/work/fitzone/': [
    ['Hero', 810],
    ['Overview', 765],
    // Flatter 2528 / 1216 key and motion videos (PO 2026-11-03), not
    // Figma's 760 / 789.
    ['Key Screens', 731],
    ['Interaction & Motion', 762],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 490],
  ],
  // SSS `484:1580`.
  '/work/sss/': [
    ['Hero', 811],
    ['Overview', 765],
    // Flatter 2528 / 1216 videos (PO 2026-11-03); Figma 765.
    ['Key Screens', 735],
    // Flatter 2528 / 1216 videos (PO 2026-11-03); Figma 815.
    ['Interaction & Motion', 787],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 469],
  ],
  // JHANYU `484:1821`.
  '/work/jhanyu/': [
    ['Hero', 811],
    ['Overview', 713],
    // Flatter 2528 / 1216 videos (PO 2026-11-03); Figma 786.
    ['Key Screens', 756],
    // Two steps and flatter 2528 / 1216 videos (PO 2026-11-03); Figma 815.
    ['Interaction & Motion', 685],
    ['Visual Extension', 410],
    ['Links', 577],
    ['Next Project', 469],
  ],
  // AMD `485:1462`.
  '/work/amd/': [
    ['Hero', 811],
    ['Overview', 765],
    ['Key Screens', 786],
    // Flatter 2528 / 1216 videos (PO 2026-11-03); Figma 705.
    ['Interaction & Motion', 685],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 469],
  ],
  // HUIFA `485:1693`.
  '/work/huifa/': [
    ['Hero', 704],
    ['Overview', 739],
    // Flatter 2528 / 1216 videos (PO 2026-11-03); Figma 786.
    ['Key Screens', 756],
    // Two steps and flatter 2528 / 1216 videos (PO 2026-11-03); Figma 792.
    ['Interaction & Motion', 662],
    ['Details', 714],
    ['Visual Extension', 410],
    ['Links', 627],
    ['Next Project', 469],
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

    // Off-screen sections use `content-visibility: auto`, so until rendered
    // they report their placeholder size. Render them all before measuring.
    const actualHeights = await page
      .locator('.case-study > .case-section')
      .evaluateAll((sections) => {
        for (const section of sections) {
          (section as HTMLElement).style.contentVisibility = 'visible';
        }
        return sections.map(
          (section) => section.getBoundingClientRect().height,
        );
      });

    expect(actualHeights).toHaveLength(expectedSections.length);
    for (const [index, section] of expectedSections.entries()) {
      const [name, expectedHeight, tolerance = 8, interim] =
        section as readonly [string, number, number?, string?];
      if (interim) {
        testInfo.annotations.push({
          type: 'interim',
          description: `${name} height not compared: ${interim}`,
        });
        continue;
      }
      const actualHeight = actualHeights[index] ?? Number.NaN;
      expect(
        Math.abs(actualHeight - expectedHeight),
        `${name}: expected ${expectedHeight} ±${tolerance} px, received ${actualHeight}`,
      ).toBeLessThanOrEqual(tolerance);
    }
  });
}

test('390 HUIFA Details draft is a focusable horizontal scroller', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Chromium keyboard-scroll gate.',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/huifa/');

  const scroller = page.getByRole('region', {
    name: '設計分鏡橫向捲動區',
  });
  await scroller.focus();
  await expect(scroller).toBeFocused();
  expect(
    await scroller.evaluate((element) => element.scrollWidth),
  ).toBeGreaterThan(await scroller.evaluate((element) => element.clientWidth));
  await scroller.evaluate((element) => {
    element.scrollLeft = 200;
  });
  expect(
    await scroller.evaluate((element) => element.scrollLeft),
  ).toBeGreaterThan(0);

  const draftLabel = scroller
    .locator('xpath=ancestor::figure')
    .locator('figcaption');
  const liveMedia = page
    .locator('.details-compare .detail-compare-item')
    .nth(1)
    .locator('.media-frame');
  const draftLabelBox = await draftLabel.boundingBox();
  const liveMediaBox = await liveMedia.boundingBox();
  expect(draftLabelBox?.height).toBeCloseTo(15, 0);
  expect(liveMediaBox).toMatchObject({ x: 20, width: 350 });
});

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

test('motion step switches keep media visible and inactive panels inert', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Chromium-only.');
  await stubMediaPlayback(page);
  await page.goto('/work/88win/');
  const motion = page.locator('motion-steps');
  await motion.scrollIntoViewIfNeeded();
  await motion.getByRole('tab').nth(1).click();
  const active = motion.locator('[role="tabpanel"].is-active');
  await expect(active).toHaveCount(1);
  expect(
    await active.evaluate((panel) => {
      const poster = panel.querySelector<HTMLImageElement>('.video-poster');
      const video = panel.querySelector<HTMLVideoElement>('video');
      return (
        Boolean(poster && getComputedStyle(poster).visibility !== 'hidden') ||
        !video?.paused
      );
    }),
  ).toBe(true);
  await expect(motion.locator('[role="tabpanel"]').nth(0)).toHaveAttribute(
    'inert',
    '',
  );
});

test('motion steps auto-advance 01 to 03 once in view', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs the sequence in one browser.',
  );
  await stubMediaPlayback(page);
  await page.goto('/work/88win/');

  const motion = page.locator('motion-steps');
  const tabs = motion.getByRole('tab');
  const videos = motion.locator('video');
  await motion.scrollIntoViewIfNeeded();
  await expect(videos.nth(0)).toHaveAttribute('data-test-play-count', /.+/u);
  await expect(videos.nth(1)).not.toHaveAttribute(
    'data-test-play-count',
    /.+/u,
  );
  await expect(videos.nth(2)).not.toHaveAttribute(
    'data-test-play-count',
    /.+/u,
  );

  await videos
    .nth(0)
    .evaluate((video) => video.dispatchEvent(new Event('ended')));
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(videos.nth(1)).toHaveAttribute('data-test-play-count', /.+/u);

  await videos
    .nth(1)
    .evaluate((video) => video.dispatchEvent(new Event('ended')));
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(videos.nth(2)).toHaveAttribute('data-test-play-count', /.+/u);

  await videos
    .nth(2)
    .evaluate((video) => video.dispatchEvent(new Event('ended')));
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
});

test('motion steps stop auto-advance after user selection', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs the sequence in one browser.',
  );
  await stubMediaPlayback(page);
  await page.goto('/work/88win/');

  const motion = page.locator('motion-steps');
  const tabs = motion.getByRole('tab');
  const videos = motion.locator('video');
  await motion.scrollIntoViewIfNeeded();
  await expect(videos.nth(0)).toHaveAttribute('data-test-play-count', /.+/u);
  await tabs.nth(1).click();
  await videos
    .nth(1)
    .evaluate((video) => video.dispatchEvent(new Event('ended')));

  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'false');
  await expect(videos.nth(2)).not.toHaveAttribute(
    'data-test-play-count',
    /.+/u,
  );
});

test('motion steps preserve a user selection made before entering view', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs the intersection sequence in one browser.',
  );
  await stubMediaPlayback(page);
  await page.goto('/work/88win/');

  const motion = page.locator('motion-steps');
  const tabs = motion.getByRole('tab');
  const initiallyVisible = await motion.evaluate((element) => {
    const { bottom, height, top } = element.getBoundingClientRect();
    return (
      Math.max(0, Math.min(bottom, window.innerHeight) - Math.max(top, 0)) /
      height
    );
  });
  expect(initiallyVisible).toBeLessThan(0.5);

  await tabs.nth(1).dispatchEvent('click');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await motion.scrollIntoViewIfNeeded();

  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('reduced motion disables motion steps auto-play', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Runs the reduced-motion behavior in one browser.',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stubMediaPlayback(page);
  await page.goto('/work/88win/');

  const motion = page.locator('motion-steps');
  await motion.scrollIntoViewIfNeeded();
  await expect(motion.getByRole('tab').first()).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(motion.locator('video').first()).not.toHaveAttribute(
    'data-test-play-count',
    /.+/u,
  );
});

test('resume links to the supplied PDF', async ({ page, request }) => {
  await page.goto('/resume/');
  await expect(
    page.getByRole('link', { name: 'Download PDF' }),
  ).toHaveAttribute('href', '/files/Syuan-Ci-Resume.pdf');
  const response = await request.get('/files/Syuan-Ci-Resume.pdf');
  expect(response.ok()).toBe(true);
});

test('88Win hero image is requested eagerly at high priority', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Chromium-only LCP gate.',
  );
  await page.goto('/work/88win/');
  const hero = page.locator('.case-hero picture img').first();
  await expect(hero).toHaveAttribute('loading', 'eager');
  expect(
    await hero.evaluate((image) => (image as HTMLImageElement).fetchPriority),
  ).toBe('high');
});

test('88Win requests only its own page extension fonts', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'Chromium-only font request gate.',
  );
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (/noto-sans-tc/iu.test(pathname)) fontRequests.push(pathname);
  });
  await page.goto('/work/88win/', { waitUntil: 'networkidle' });

  expect(
    fontRequests.some((pathname) => /ext-work-88win/iu.test(pathname)),
  ).toBe(true);
  expect(fontRequests.some((pathname) => /ext-shared/iu.test(pathname))).toBe(
    false,
  );
  const otherPageKeys = [
    ...projectSlugs
      .filter((slug) => slug !== '88win')
      .map((slug) => `work-${slug}`),
    'resume',
    '404',
  ];
  for (const pageKey of otherPageKeys) {
    expect(
      fontRequests.some((pathname) => pathname.includes(`ext-${pageKey}`)),
      `unexpected ${pageKey} font request:\n${fontRequests.join('\n')}`,
    ).toBe(false);
  }
});
