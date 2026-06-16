import { test, expect } from '@playwright/test';

// These are the exact EN/ES pairs for keys that appear in the page markup
const translations = {
  hero_h1:     { en: 'I orchestrate AI',                   es: 'Orquesto IA' },
  hero_status: { en: 'AI ENGINEER · FULL-STACK · REMOTE',  es: 'AI ENGINEER · FULL-STACK · REMOTO' },
  hero_cta_cv: { en: 'Download CV',                        es: 'Descargar CV' },
} as const;

test.describe('LangToggle — EN/ES switch', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted lang so each test starts in EN
    await page.addInitScript(() => {
      localStorage.removeItem('lang');
    });
    await page.goto('/');
    // Wait for the toggle to be present and scripts to run
    await page.waitForSelector('[data-lang-target="en"]');
  });

  test('page loads in English by default', async ({ page }) => {
    const h1 = page.locator('[data-i18n="hero_h1"]').first();
    await expect(h1).toHaveText(translations.hero_h1.en);

    const status = page.locator('[data-i18n="hero_status"]').first();
    await expect(status).toHaveText(translations.hero_status.en);

    const cta = page.locator('[data-i18n="hero_cta_cv"]').first();
    await expect(cta).toHaveText(translations.hero_cta_cv.en);
  });

  test('clicking ES button switches all data-i18n nodes to Spanish', async ({ page }) => {
    const esBtn = page.locator('[data-lang-target="es"]');
    await esBtn.click();

    // Wait for the text swap (one rAF / subscriber tick)
    const h1 = page.locator('[data-i18n="hero_h1"]').first();
    await expect(h1).toHaveText(translations.hero_h1.es);

    const status = page.locator('[data-i18n="hero_status"]').first();
    await expect(status).toHaveText(translations.hero_status.es);

    const cta = page.locator('[data-i18n="hero_cta_cv"]').first();
    await expect(cta).toHaveText(translations.hero_cta_cv.es);
  });

  test('clicking EN button after ES switches back to English', async ({ page }) => {
    // Switch to ES first
    await page.locator('[data-lang-target="es"]').click();
    await expect(page.locator('[data-i18n="hero_h1"]').first()).toHaveText(translations.hero_h1.es);

    // Switch back to EN
    await page.locator('[data-lang-target="en"]').click();
    await expect(page.locator('[data-i18n="hero_h1"]').first()).toHaveText(translations.hero_h1.en);
    await expect(page.locator('[data-i18n="hero_status"]').first()).toHaveText(translations.hero_status.en);
  });

  test('language choice persists across page reload', async ({ browser }) => {
    // Use a fresh context (no addInitScript) so localStorage is not cleared on reload
    const context = await browser.newContext();
    const page = await context.newPage();

    // Start in a clean state (no persisted lang)
    await page.goto('/');
    await page.waitForSelector('[data-lang-target="en"]');

    // Switch to ES and confirm the swap happened
    await page.locator('[data-lang-target="es"]').click();
    await expect(page.locator('[data-i18n="hero_h1"]').first()).toHaveText(translations.hero_h1.es);

    // Reload the page — localStorage should keep 'lang' = 'es'
    await page.reload();
    await page.waitForSelector('[data-lang-target="en"]');

    // apply.ts subscriber fires synchronously on initI18n(); wait for the swap
    const h1 = page.locator('[data-i18n="hero_h1"]').first();
    await expect(h1).toHaveText(translations.hero_h1.es, { timeout: 5000 });

    await context.close();
  });

  test('aria-pressed reflects active language on EN button', async ({ page }) => {
    const enBtn = page.locator('[data-lang-target="en"]');
    await expect(enBtn).toHaveAttribute('aria-pressed', 'true');

    await page.locator('[data-lang-target="es"]').click();
    await expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('aria-pressed reflects active language on ES button', async ({ page }) => {
    const esBtn = page.locator('[data-lang-target="es"]');
    await expect(esBtn).toHaveAttribute('aria-pressed', 'false');

    await esBtn.click();
    await expect(esBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
