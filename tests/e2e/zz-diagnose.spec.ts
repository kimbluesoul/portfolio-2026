import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TEMPORARY stress run for the WebKit colour-contrast flake. Removed before merge.
for (let i = 0; i < 40; i++) {
  test(`stress 88win settled colour #${i}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work/88win/');
    await expect(page.locator('h1')).toHaveCount(1);
    const transitions = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition).length,
    );
    expect(transitions).toBe(0);
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
