import { expect, test } from '@playwright/test';

const viewports = [
  {
    width: 1920,
    height: 1080,
    cardWidth: 1728,
    cardHeight: 500,
    stickyTop: 290,
    peakHeight: 966.7,
    peakScale: 1.333,
    heroGap: 112.8,
  },
  {
    width: 1440,
    height: 900,
    cardWidth: 1296,
    cardHeight: 375,
    stickyTop: 262.5,
    peakHeight: 725,
    peakScale: 1.333,
    heroGap: 112.8,
  },
  {
    width: 390,
    height: 844,
    cardWidth: 350,
    cardHeight: 200,
    stickyTop: 322,
    peakHeight: 387.8,
    peakScale: 1.337,
    heroGap: 56,
  },
] as const;

const checkpoints = [
  { offset: (growDistance: number) => -growDistance, progress: 0 },
  { offset: () => 0, progress: 1 },
  {
    offset: (_growDistance: number, runway: number) => 0.05 * runway,
    progress: 1,
  },
  {
    offset: (_growDistance: number, runway: number) => 0.5 * runway,
    progress: 0.549,
  },
  { offset: (_growDistance: number, runway: number) => runway, progress: 0 },
] as const;

for (const viewport of viewports) {
  test(`featured reveal follows the five progress points at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'The reveal geometry is covered in Chromium.',
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const reveal = page.locator('featured-reveal');
    await expect(page.locator('#home-heading')).toHaveText(
      '設計畫面，也設計畫面之間的瞬間。',
    );
    await expect(reveal).toHaveAttribute('data-progress', '0.000');

    const geometry = await reveal.evaluate((element) => {
      const frame = element.querySelector<HTMLElement>(
        '[data-featured-frame]',
      )!;
      const sticky = element.querySelector<HTMLElement>(
        '[data-featured-sticky]',
      )!;
      const stickyTop = Number.parseFloat(getComputedStyle(sticky).top);
      const documentTop = element.getBoundingClientRect().top + scrollY;
      const viewportHeight = document.documentElement.clientHeight;
      const cardRect = frame.getBoundingClientRect();
      const credentialRect = document
        .querySelector<HTMLElement>('.credentials')!
        .getBoundingClientRect();
      const windowElement = element.querySelector<HTMLElement>(
        '[data-featured-window]',
      )!;
      return {
        cardHeight: cardRect.height,
        cardWidth: cardRect.width,
        documentTop,
        growDistance: Math.min(documentTop, viewportHeight * 0.9) - stickyTop,
        runway: element.clientHeight - frame.clientHeight,
        heroGap: cardRect.top - credentialRect.bottom,
        peakHeight: windowElement.clientHeight,
        peakScale:
          (document.documentElement.clientWidth / cardRect.width) * 1.2,
        stickyTop,
      };
    });

    expect(geometry.runway).toBeCloseTo(viewport.height * 0.5, 0);
    expect(geometry.cardWidth).toBeCloseTo(viewport.cardWidth, 0);
    expect(geometry.cardHeight).toBeCloseTo(viewport.cardHeight, 0);
    expect(geometry.stickyTop).toBeCloseTo(viewport.stickyTop, 1);
    expect(geometry.peakHeight).toBeCloseTo(viewport.peakHeight, 0);
    expect(geometry.peakScale).toBeCloseTo(viewport.peakScale, 2);
    expect(geometry.heroGap).toBeCloseTo(viewport.heroGap, 0);

    for (const checkpoint of checkpoints) {
      const offset = checkpoint.offset(geometry.growDistance, geometry.runway);
      await page.evaluate(
        ({ documentTop, offset, stickyTop }) => {
          scrollTo({
            top: documentTop + offset - stickyTop,
            behavior: 'instant',
          });
        },
        { ...geometry, offset },
      );
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );

      expect(Number(await reveal.getAttribute('data-progress'))).toBeCloseTo(
        checkpoint.progress,
        2,
      );
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBe(0);
      await expect(page.locator('.accent-moment')).toHaveCSS(
        'color',
        'rgb(31, 59, 214)',
      );

      if (offset === 0) {
        const peak = await page
          .locator('[data-featured-window]')
          .evaluate((element) => {
            const { left, top, width, height } =
              element.getBoundingClientRect();
            const stage = element.querySelector<HTMLElement>(
              '[data-featured-stage]',
            )!;
            return {
              height,
              left,
              radius: getComputedStyle(element).borderTopLeftRadius,
              scale: new DOMMatrix(getComputedStyle(stage).transform).a,
              top,
              width,
            };
          });
        expect(peak.left).toBeCloseTo(0, 0);
        expect(peak.top).toBeCloseTo(
          viewport.stickyTop - (viewport.peakHeight - viewport.cardHeight) / 2,
          0,
        );
        expect(peak.width).toBeCloseTo(viewport.width, 0);
        expect(peak.height).toBeCloseTo(viewport.peakHeight, 0);
        expect(peak.scale).toBeCloseTo(viewport.peakScale, 2);
        expect(peak.radius).toBe('0px');
        await expect(page.locator('.hero')).toHaveCSS('opacity', '0.45');
      }
    }

    await expect(page.locator('.accent-glint')).toHaveAttribute(
      'data-text',
      '瞬間',
    );
    expect(
      await page
        .locator('.accent-glint')
        .evaluate(
          (element) => getComputedStyle(element, '::before').animationPlayState,
        ),
    ).toBe('paused');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect
      .poll(() =>
        page
          .locator('.accent-glint')
          .evaluate(
            (element) =>
              getComputedStyle(element, '::before').animationPlayState,
          ),
      )
      .toBe('running');
  });
}

test('enhanced CSS keeps the unupgraded reveal window at card size', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'The custom-element fallback is covered in Chromium.',
  );
  await page.addInitScript(() => {
    const define = customElements.define.bind(customElements);
    customElements.define = (name, constructor, options) => {
      if (name !== 'featured-reveal') define(name, constructor, options);
    };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const geometry = await page.locator('featured-reveal').evaluate((element) => {
    const frame = element.querySelector<HTMLElement>('[data-featured-frame]')!;
    const windowElement = element.querySelector<HTMLElement>(
      '[data-featured-window]',
    )!;
    return {
      frame: frame.getBoundingClientRect().toJSON(),
      window: windowElement.getBoundingClientRect().toJSON(),
    };
  });

  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(geometry.window[key]).toBeCloseTo(geometry.frame[key], 0);
  }
});

test('short viewports keep the sticky top below the header', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'The reveal geometry is covered in Chromium.',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');

  const reveal = page.locator('featured-reveal');
  await expect(reveal).toHaveAttribute('data-ready', '');
  const stickyTop = await reveal
    .locator('[data-featured-sticky]')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).top));
  expect(stickyTop).toBe(116);
});

test('reduced motion has no featured runway', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const reveal = page.locator('featured-reveal');
  const runway = await reveal.evaluate((element) => {
    const frame = element.querySelector<HTMLElement>('[data-featured-frame]')!;
    return element.clientHeight - frame.clientHeight;
  });

  expect(runway).toBe(0);
  await expect(reveal).toHaveAttribute('data-progress', '0.000');
  await expect(page.locator('.accent-moment')).toHaveCSS(
    'color',
    'rgb(31, 59, 214)',
  );
  await expect(page.locator('.accent-glint')).toHaveCSS('display', 'none');
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBe(0);
});

test('JavaScript off and reduced motion keep the same card geometry', async ({
  browser,
  page,
}) => {
  const viewport = { width: 1440, height: 900 };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(viewport);
  await page.goto('/');
  const reducedRect = await page.locator('.featured .media').boundingBox();

  const noScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport,
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('http://127.0.0.1:4321/');
  const noScriptRect = await noScriptPage
    .locator('.featured .media')
    .boundingBox();
  const noScriptRunway = await noScriptPage
    .locator('featured-reveal')
    .evaluate((element) => {
      const frame = element.querySelector<HTMLElement>(
        '[data-featured-frame]',
      )!;
      return element.clientHeight - frame.clientHeight;
    });

  expect(reducedRect).not.toBeNull();
  expect(noScriptRect).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(noScriptRect?.[key]).toBeCloseTo(reducedRect?.[key] ?? 0, 0);
  }
  expect(noScriptRunway).toBe(0);
  await noScriptContext.close();
});
