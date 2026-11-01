import { expect, test } from '@playwright/test';

// TEMPORARY diagnostic for the WebKit color-contrast flake. Removed before merge.
for (let i = 0; i < 40; i++) {
  test(`diagnose 88win settled color #${i}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work/88win/');
    await expect(page.locator('h1')).toHaveCount(1);
    const snap = await page.evaluate(() => {
      const pick = (sel: string) => {
        const el = document.querySelector(sel)!;
        const s = getComputedStyle(el);
        return {
          sel,
          color: s.color,
          fill: s.getPropertyValue('-webkit-text-fill-color'),
          anims: el
            .getAnimations()
            .map((a) =>
              'transitionProperty' in a
                ? `T:${(a as CSSTransition).transitionProperty}:${a.playState}`
                : `A:${a.playState}`,
            ),
        };
      };
      return {
        all: document.getAnimations().length,
        props: [
          ...new Set(
            document
              .getAnimations()
              .map((a) =>
                'transitionProperty' in a
                  ? (a as CSSTransition).transitionProperty
                  : 'anim',
              ),
          ),
        ].slice(0, 30),
        fonts: document.fonts.status,
        ready: document.readyState,
        els: [
          pick('.interaction-motion h2'),
          pick('.motion-tabs strong'),
          pick('.site-footer a'),
          pick('.interaction-motion'),
        ],
      };
    });
    const bad =
      snap.els.some(
        (e) => e.fill.startsWith('rgb(0, 0, 0)') || e.anims.length > 0,
      ) || snap.all > 0;
    if (bad) throw new Error(`BAD ${JSON.stringify(snap)}`);
  });
}
