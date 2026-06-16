import { test, expect } from '@playwright/test';

test('homepage loads and shows scaffold placeholder', async ({ page }) => {
  await page.goto('/');

  // Token-colored heading must be visible
  const heading = page.getByRole('heading', { name: /Portfolio — scaffold OK/i });
  await expect(heading).toBeVisible();

  // Page must have a title
  await expect(page).toHaveTitle(/Alexis Palacio/);
});
