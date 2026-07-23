import { test, expect } from '@playwright/test';

/**
 * Bug-hunt mobile controls — touch UX change.
 *
 * On touch devices the pixel-art "bug hunt" easter egg arms the hammer by
 * DEFAULT: a single tap on the fly swats it, with no trip through the weapons
 * menu. Choosing the insecticide from the menu upgrades a tap to a lethal kill.
 * Desktop pointer behaviour (hover hand, grab, charged hammer) is unchanged.
 *
 * The game auto-triggers only after ~9s of genuine inactivity. Its manual dev
 * trigger (`window.__bugHunt`) is stripped from the production `astro preview`
 * build these tests run against, so each test simply waits for the fly to
 * appear on its own and never touches the page in the meantime.
 */

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const APPEAR_TIMEOUT = 15000; // 9s idle + flight; generous for CI

test.describe('Bug hunt — mobile touch controls', () => {
  test('hammer is armed by default: tapping the fly swats it without the menu', async ({
    page,
  }) => {
    await page.goto('/');
    // Do NOT interact — let the idle timer trigger the game.
    await page.locator('.bh-bug').waitFor({ state: 'attached', timeout: APPEAR_TIMEOUT });

    // Tap the fly directly, before the weapons menu is ever touched.
    await page.locator('.bh-bug').dispatchEvent('click');

    // A hammer strike knocks the fly out: it ragdolls (a rotate transform) and
    // the game tears its root down shortly after. Either proves the tap landed.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const b = document.querySelector('.bh-bug') as HTMLElement | null;
            const root = document.querySelector('.bh-root');
            return (!!b && /rotate\(/.test(b.style.transform)) || !root;
          }),
        { timeout: 6000 }
      )
      .toBe(true);
  });

  test('choosing the insecticide makes a tap lethal (EXTERMINATED)', async ({ page }) => {
    await page.goto('/');
    // The weapons menu slides in ~1.6s after the fly appears.
    await page.locator('.bh-menu').waitFor({ state: 'attached', timeout: APPEAR_TIMEOUT });

    await page.locator('.bh-weapon[data-weapon="spray"]').dispatchEvent('click');
    await page.locator('.bh-bug').dispatchEvent('click');

    await expect(page.locator('.bh-toast')).toBeVisible({ timeout: 4000 });
  });
});
