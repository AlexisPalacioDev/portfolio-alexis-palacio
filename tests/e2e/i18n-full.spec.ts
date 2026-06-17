import { test, expect } from '@playwright/test';

/**
 * Full i18n coverage E2E tests — WU-5 (Phase 7).
 *
 * Verifies that toggling EN → ES swaps representative strings across all
 * major content sections (About, Stack, Services, Contact), and that the
 * ProjectDeck detail panel also updates when the language is changed while
 * a non-default project is active.
 *
 * Tests run against `astro preview` (production static build).
 */

// Representative EN/ES sentinel pairs from the dictionary
const SENTINELS = {
  about_h2: {
    en: "I don't just write code. I make AI get the job done.",
    es: 'No solo escribo código. Hago que la IA cumpla el objetivo.',
  },
  about_p1_start: {
    en: 'Full-stack developer with 5+',
    es: 'Desarrollador full-stack con 5+',
  },
  skills_h2: {
    en: 'Built to orchestrate, not just to code.',
    es: 'Hecho para orquestar, no solo para codear.',
  },
  skills_ai_title: {
    en: 'AI Orchestration & Agents',
    es: 'Orquestación de IA y Agentes',
  },
  services_h2: {
    en: 'Hire me for the hard part.',
    es: 'Contrátame para la parte difícil.',
  },
  svc1_title: {
    en: 'AI Agents & Automation',
    es: 'Agentes de IA y Automatización',
  },
  contact_h2: {
    en: "Let's build something.",
    es: 'Construyamos algo.',
  },
  contact_sub_start: {
    en: 'Open to remote roles',
    es: 'Abierto a roles remotos',
  },
  available: {
    en: 'Available for remote work',
    es: 'Disponible para trabajo remoto',
  },
  footer_built: {
    en: 'Designed & built with intent.',
    es: 'Diseñado y construido con intención.',
  },
} as const;

test.describe('Full i18n audit — EN/ES across all sections', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted lang — start from EN
    await page.addInitScript(() => {
      localStorage.removeItem('lang');
    });
    await page.goto('/');
    await page.waitForSelector('[data-lang-target="en"]');
  });

  test('all representative strings display in English by default', async ({ page }) => {
    // About
    const aboutH2 = page.locator('[data-i18n="about_h2"]').first();
    await expect(aboutH2).toHaveText(SENTINELS.about_h2.en);

    // Stack
    const skillsH2 = page.locator('[data-i18n="skills_h2"]').first();
    await expect(skillsH2).toHaveText(SENTINELS.skills_h2.en);

    const aiTitle = page.locator('[data-i18n="skills_ai_title"]').first();
    await expect(aiTitle).toHaveText(SENTINELS.skills_ai_title.en);

    // Services
    const svcH2 = page.locator('[data-i18n="services_h2"]').first();
    await expect(svcH2).toHaveText(SENTINELS.services_h2.en);

    const svc1Title = page.locator('[data-i18n="svc1_title"]').first();
    await expect(svc1Title).toHaveText(SENTINELS.svc1_title.en);

    // Contact
    const contactH2 = page.locator('[data-i18n="contact_h2"]').first();
    await expect(contactH2).toHaveText(SENTINELS.contact_h2.en);

    const availablePill = page.locator('[data-i18n="available"]').first();
    await expect(availablePill).toHaveText(SENTINELS.available.en);

    // Footer
    const footerBuilt = page.locator('[data-i18n="footer_built"]').first();
    await expect(footerBuilt).toHaveText(SENTINELS.footer_built.en);
  });

  test('toggling to ES swaps strings across About, Stack, Services, Contact, Footer', async ({
    page,
  }) => {
    const esBtn = page.locator('[data-lang-target="es"]');
    await esBtn.click();

    // Wait for the lang subscriber to fire and all data-i18n nodes to swap
    await page.waitForTimeout(300);

    // About
    const aboutH2 = page.locator('[data-i18n="about_h2"]').first();
    await expect(aboutH2).toHaveText(SENTINELS.about_h2.es);

    // Stack
    const skillsH2 = page.locator('[data-i18n="skills_h2"]').first();
    await expect(skillsH2).toHaveText(SENTINELS.skills_h2.es);

    const aiTitle = page.locator('[data-i18n="skills_ai_title"]').first();
    await expect(aiTitle).toHaveText(SENTINELS.skills_ai_title.es);

    // Services
    const svcH2 = page.locator('[data-i18n="services_h2"]').first();
    await expect(svcH2).toHaveText(SENTINELS.services_h2.es);

    const svc1Title = page.locator('[data-i18n="svc1_title"]').first();
    await expect(svc1Title).toHaveText(SENTINELS.svc1_title.es);

    // Contact
    const contactH2 = page.locator('[data-i18n="contact_h2"]').first();
    await expect(contactH2).toHaveText(SENTINELS.contact_h2.es);

    const availablePill = page.locator('[data-i18n="available"]').first();
    await expect(availablePill).toHaveText(SENTINELS.available.es);

    // Footer
    const footerBuilt = page.locator('[data-i18n="footer_built"]').first();
    await expect(footerBuilt).toHaveText(SENTINELS.footer_built.es);
  });

  test('toggling back to EN restores all English strings', async ({ page }) => {
    const esBtn = page.locator('[data-lang-target="es"]');
    const enBtn = page.locator('[data-lang-target="en"]');

    await esBtn.click();
    await page.waitForTimeout(200);
    await enBtn.click();
    await page.waitForTimeout(200);

    // Spot-check several sections
    await expect(page.locator('[data-i18n="about_h2"]').first()).toHaveText(
      SENTINELS.about_h2.en
    );
    await expect(page.locator('[data-i18n="services_h2"]').first()).toHaveText(
      SENTINELS.services_h2.en
    );
    await expect(page.locator('[data-i18n="contact_h2"]').first()).toHaveText(
      SENTINELS.contact_h2.en
    );
  });

  test('no visible EN strings remain on critical sections when switched to ES', async ({
    page,
  }) => {
    const esBtn = page.locator('[data-lang-target="es"]');
    await esBtn.click();
    await page.waitForTimeout(300);

    // Verify that known-English sentinel strings are NOT present in specific data-i18n nodes
    const aboutH2Text = await page.locator('[data-i18n="about_h2"]').first().textContent();
    expect(aboutH2Text).not.toContain("I don't just write code");

    const skillsH2Text = await page.locator('[data-i18n="skills_h2"]').first().textContent();
    expect(skillsH2Text).not.toContain('Built to orchestrate');

    const svcH2Text = await page.locator('[data-i18n="services_h2"]').first().textContent();
    expect(svcH2Text).not.toContain('Hire me for the hard part');

    const contactH2Text = await page.locator('[data-i18n="contact_h2"]').first().textContent();
    expect(contactH2Text).not.toContain("Let's build something");
  });
});

test.describe('ProjectDeck lang-switch with non-default active project', () => {
  test('switching to ES while a non-default project is active updates the detail panel', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('lang');
    });
    await page.goto('/');

    // Scroll to projects section and wait for hydration
    await page.evaluate(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForSelector('#work-deck[data-hydrated="true"]', {
      state: 'attached',
      timeout: 8000,
    });
    await page.waitForTimeout(300);

    // Activate card 3 (Tripi — has real EN/ES role translations)
    const cards = page.locator('#work-deck .work-card');
    await cards.nth(3).evaluate((el) =>
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    );
    await page.waitForTimeout(600);

    // Confirm EN detail is showing (role should contain 'Full-Stack Developer')
    const detailRole = page.locator('#detail-role');
    const enRole = await detailRole.textContent();
    expect(enRole).toContain('Full-Stack');

    // Toggle to ES
    await page.locator('[data-lang-target="es"]').click();
    await page.waitForTimeout(300);

    // Detail role should switch to ES translation
    const esRole = await detailRole.textContent();
    // Spanish translation for Tripi role: 'Desarrollador Full-Stack'
    expect(esRole).toContain('Desarrollador');
    expect(esRole).not.toContain('Full-Stack Developer');

    // Also check period — Tripi has same value in both langs ('2022 — 2023') so we
    // check desc instead (which is clearly different)
    const detailDesc = page.locator('#detail-desc');
    const esDesc = await detailDesc.textContent();
    expect(esDesc).toBeTruthy();
    // ES desc for AppTreeking (card 3) should be the Spanish copy
    expect(esDesc).toContain('Marketplace móvil');
  });

  test('switching back to EN after non-default project restores EN text', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('lang');
    });
    await page.goto('/');

    await page.evaluate(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForSelector('#work-deck[data-hydrated="true"]', {
      state: 'attached',
      timeout: 8000,
    });
    await page.waitForTimeout(300);

    // Activate card 4 (Carl Jung AI)
    const cards = page.locator('#work-deck .work-card');
    await cards.nth(4).evaluate((el) =>
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    );
    await page.waitForTimeout(600);

    // Record EN desc
    const detailDesc = page.locator('#detail-desc');
    const enDesc = await detailDesc.textContent();
    expect(enDesc).toContain('Carl Jung');

    // Switch to ES
    await page.locator('[data-lang-target="es"]').click();
    await page.waitForTimeout(200);

    const esDesc = await detailDesc.textContent();
    expect(esDesc).toBeTruthy();
    // ES should contain the Spanish text
    expect(esDesc).toContain('Jung');

    // Switch back to EN
    await page.locator('[data-lang-target="en"]').click();
    await page.waitForTimeout(200);

    const backToEnDesc = await detailDesc.textContent();
    expect(backToEnDesc).toBe(enDesc);
  });
});
