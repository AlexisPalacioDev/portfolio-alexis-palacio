import { test, expect } from '@playwright/test';

/**
 * Hero scroll-cue E2E tests — fix-cv-link-and-hero-scroll-cue change.
 *
 * Validates that:
 * - `.scroll-cue` is hidden on mobile viewports and never overlaps the
 *   "Hire me" CTA
 * - `.scroll-cue` remains visible on desktop viewports (no regression)
 * - The Download CV link resolves to the correct PDF asset
 *
 * Tests run against `astro preview` (production static build).
 */

test.describe('Hero scroll cue — mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('.scroll-cue is not visible at 390px', async ({ page }) => {
    await expect(page.locator('.scroll-cue')).not.toBeVisible();
  });

  test('.scroll-cue does not overlap the "Hire me" CTA at 390px', async ({ page }) => {
    const scrollCue = page.locator('.scroll-cue');
    const hireCta = page.locator('a[data-i18n="hero_cta_hire"]').first();

    await expect(hireCta).toBeVisible();
    const cueBox = await scrollCue.boundingBox();
    const ctaBox = await hireCta.boundingBox();

    // .scroll-cue is display:none below 640px, so it has no box at all —
    // there is nothing left to overlap the CTA with.
    expect(cueBox).toBeNull();
    expect(ctaBox).not.toBeNull();
  });
});

test.describe('Hero scroll cue — desktop parity', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('.scroll-cue is visible at 1280px', async ({ page }) => {
    await expect(page.locator('.scroll-cue')).toBeVisible();
  });
});

test.describe('CV download link', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Download CV link resolves to /Alexis-Palacio-CV.pdf', async ({ page }) => {
    const cvLink = page.locator('a[download]').first();
    await expect(cvLink).toHaveAttribute('href', '/Alexis-Palacio-CV.pdf');
  });
});
