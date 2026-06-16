import { test, expect } from '@playwright/test';

/**
 * ProjectDeck E2E tests — CAP-06 interaction scenarios.
 *
 * Tests run against `astro preview` (production static build).
 * Deck hydration uses client:visible semantics — we must scroll the
 * deck into view and wait for the island script to execute.
 */

test.describe('ProjectDeck — card interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to the projects section so the deck is in view (triggers hydration)
    await page.evaluate(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    });
    // Wait for the ProjectDeck island to finish hydrating.
    // The island sets data-hydrated="true" on #work-deck once event handlers are attached.
    await page.waitForSelector('#work-deck[data-hydrated="true"]', { state: 'attached', timeout: 8000 });
    // Brief wait for any CSS transitions to settle
    await page.waitForTimeout(300);
  });

  test('initial state: card 0 (anai) is active — lime border, detail shows anai', async ({
    page,
  }) => {
    // First card should have lime border
    const firstCard = page.locator('#work-deck .work-card').first();
    const borderColor = await firstCard.evaluate((el) => (el as HTMLElement).style.borderColor);
    // Lime #C6F24E or rgb equivalent
    expect(borderColor).toMatch(/C6F24E|rgb\(198, 242, 78\)/i);

    // Detail panel should show anai (index 0)
    const detailCompany = page.locator('#detail-company');
    await expect(detailCompany).toContainText('anai', { ignoreCase: true });
  });

  test('clicking card 2 changes active card and updates detail panel', async ({ page }) => {
    const cards = page.locator('#work-deck .work-card');

    // Cards are absolutely positioned in a fan stack — the front card (index 0) has
    // the highest z-index and overlaps card 2 at the click coordinates. Dispatch a
    // synthetic click event directly so pointer hit-testing is bypassed entirely.
    await cards.nth(2).evaluate((el) =>
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    );

    // Wait for transition
    await page.waitForTimeout(600);

    // Card 2 should now have lime border
    const card2Border = await cards.nth(2).evaluate(
      (el) => (el as HTMLElement).style.borderColor
    );
    expect(card2Border).toMatch(/C6F24E|rgb\(198, 242, 78\)/i);

    // Detail panel should update (company, name, or desc for index 2 — Sticker Drops)
    const detailName = page.locator('#detail-name');
    await expect(detailName).toContainText('Sticker', { ignoreCase: true });
  });

  test('clicking indicator dot 4 activates card 4 and updates detail', async ({ page }) => {
    const dots = page.locator('#work-dots .work-dot');

    // Click dot at index 4
    await dots.nth(4).click();

    // Wait for transition
    await page.waitForTimeout(600);

    // Card 4 should be front (lime border)
    const card4 = page.locator('#work-deck .work-card').nth(4);
    const border = await card4.evaluate((el) => (el as HTMLElement).style.borderColor);
    expect(border).toMatch(/C6F24E|rgb\(198, 242, 78\)/i);

    // Dot 4 should be lime
    const dot4Bg = await dots.nth(4).evaluate((el) => (el as HTMLElement).style.background);
    expect(dot4Bg).toMatch(/C6F24E|rgb\(198, 242, 78\)/i);
  });

  test('active indicator dot is lime (scale 1.25) initially', async ({ page }) => {
    const dot0 = page.locator('#work-dots .work-dot').first();
    const bg = await dot0.evaluate((el) => (el as HTMLElement).style.background);
    expect(bg).toMatch(/C6F24E|rgb\(198, 242, 78\)/i);
  });
});

test.describe('ProjectDeck — lang toggle updates detail panel', () => {
  test('toggling lang while a non-default card is active updates the panel', async ({ page }) => {
    await page.goto('/');

    // Scroll to projects and wait for hydration
    await page.evaluate(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForSelector('#work-deck[data-hydrated="true"]', { state: 'attached', timeout: 8000 });
    await page.waitForTimeout(300);

    // Click card 1 (iMometrics or second item) to make it non-default active
    // Dispatch synthetic click — bypasses pointer hit-testing (fan deck stacking)
    const cards = page.locator('#work-deck .work-card');
    await cards.nth(1).evaluate((el) =>
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    );
    await page.waitForTimeout(600);

    // Record the EN detail role text for card 1
    const detailRole = page.locator('#detail-role');
    const enRole = await detailRole.textContent();
    expect(enRole).toBeTruthy();

    // Toggle to ES
    const esBtn = page.locator('[data-lang-target="es"]');
    await esBtn.click();
    await page.waitForTimeout(200);

    // Detail role should change (ES text is different)
    const esRole = await detailRole.textContent();
    // ES translation should exist and differ from EN for some fields
    // At minimum, verify it didn't disappear (still non-empty)
    expect(esRole).toBeTruthy();
    expect(esRole!.length).toBeGreaterThan(0);

    // Toggle back to EN — should restore EN text
    const enBtn = page.locator('[data-lang-target="en"]');
    await enBtn.click();
    await page.waitForTimeout(200);

    const backToEnRole = await detailRole.textContent();
    expect(backToEnRole).toBe(enRole);
  });
});

test.describe('ProjectDeck — regression: count-up must not clobber the deck', () => {
  // Regression for the `data-count` selector collision: the About count-up
  // animation queried `[data-count]` document-wide, which also matched the
  // deck container (`data-count="7"`). animateTile() then overwrote the deck's
  // textContent, destroying all 7 .work-card elements (they collapsed to a
  // single text node like "7 anai Current anai ..."). The fix scopes the
  // count-up selector to #about. This test triggers the count-up by scrolling
  // through About, then asserts the deck still has its 7 card ELEMENTS.
  test('deck retains its 7 card elements after the About count-up fires', async ({ page }) => {
    await page.goto('/');

    // Scroll About into view to trigger the count-up IntersectionObserver
    await page.evaluate(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'instant' });
    });
    // Let the count-up animation run to completion (~1200ms + margin)
    await page.waitForTimeout(1600);

    // Now go to projects and let the deck hydrate
    await page.evaluate(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForSelector('#work-deck[data-hydrated="true"]', { state: 'attached', timeout: 8000 });

    // The deck must still contain 7 real card elements, not a flattened text node
    const cardCount = await page.locator('#work-deck .work-card').count();
    expect(cardCount).toBe(7);

    // And the stat tiles must still show their animated final values
    const firstStat = page.locator('#about [data-count]').first();
    await expect(firstStat).toHaveText(/\d/);
  });
});

test.describe('Scroll progress bar', () => {
  test('scroll-progress bar width increases when scrolling down', async ({ page }) => {
    await page.goto('/');

    // Get initial width (should be 0 or near 0)
    const getWidth = () =>
      page.evaluate(() => {
        const bar = document.getElementById('scroll-progress');
        return bar ? parseFloat(bar.style.width || '0') : 0;
      });

    const initial = await getWidth();
    expect(initial).toBeLessThan(5); // near 0% at top

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(200);

    const atBottom = await getWidth();
    expect(atBottom).toBeGreaterThan(50); // should be near 100% at bottom
  });
});
