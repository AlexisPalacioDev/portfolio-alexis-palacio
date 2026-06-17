import { test, expect } from '@playwright/test';

/**
 * CTA links E2E tests — CAP-03 + CAP-09 acceptance scenarios.
 *
 * Validates that:
 * - "Hire me" CTA scrolls to #contact
 * - "Download CV" link has the correct href + download attribute
 * - All 4 contact tiles link to correct external URLs
 *
 * Tests run against `astro preview` (production static build).
 */

test.describe('CTA links — Hero section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('Hire me CTA has href="#contact"', async ({ page }) => {
    const hireMe = page.locator('a[data-i18n="hero_cta_hire"]').first();
    const href = await hireMe.getAttribute('href');
    expect(href).toBe('#contact');
  });

  test('Download CV link has correct href and download attribute', async ({ page }) => {
    const cvLink = page.locator('a[download]').first();
    const href = await cvLink.getAttribute('href');
    const download = await cvLink.getAttribute('download');
    expect(href).toBe('/Alexis-Palacio-CV.pdf');
    expect(download).toBe('Alexis-Palacio-CV.pdf');
  });

  test('Hire me CTA scrolls viewport to #contact section', async ({ page }) => {
    // Click the Hire me link
    await page.locator('a[data-i18n="hero_cta_hire"]').first().click();
    // Wait for scroll to settle
    await page.waitForTimeout(600);
    // The contact section should now be visible
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeInViewport({ ratio: 0.1 });
  });
});

test.describe('Contact tiles — CAP-09', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Email tile links to correct mailto', async ({ page }) => {
    const emailTile = page.locator('a[href^="mailto:alexis26-93@live.com"]').first();
    await expect(emailTile).toBeVisible();
    const href = await emailTile.getAttribute('href');
    expect(href).toBe('mailto:alexis26-93@live.com');
  });

  test('WhatsApp tile links to wa.me with correct number', async ({ page }) => {
    const waTile = page.locator('a[href^="https://wa.me/573206088114"]').first();
    await expect(waTile).toBeVisible();
    const href = await waTile.getAttribute('href');
    expect(href).toContain('wa.me/573206088114');
  });

  test('LinkedIn tile links to correct profile', async ({ page }) => {
    const linkedinTile = page.locator('a[href="https://www.linkedin.com/in/poisoneddog/"]').first();
    await expect(linkedinTile).toBeVisible();
  });

  test('GitHub tile links to correct profile', async ({ page }) => {
    const githubTile = page.locator('a[href="https://github.com/AlexisPalacioDev"]').first();
    await expect(githubTile).toBeVisible();
  });
});
