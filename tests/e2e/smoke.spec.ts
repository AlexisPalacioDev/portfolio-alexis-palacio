import { test, expect } from '@playwright/test';

test('homepage loads with i18n hero content', async ({ page }) => {
  await page.goto('/');

  // Title must be present
  await expect(page).toHaveTitle(/Alexis Palacio/);

  // Hero H1 must be visible (data-i18n wired, EN default)
  const h1 = page.locator('[data-i18n="hero_h1"]').first();
  await expect(h1).toBeVisible();
  await expect(h1).toHaveText('I orchestrate AI');

  // Language toggle buttons must be present
  const enBtn = page.locator('[data-lang-target="en"]');
  const esBtn = page.locator('[data-lang-target="es"]');
  await expect(enBtn).toBeVisible();
  await expect(esBtn).toBeVisible();
});
