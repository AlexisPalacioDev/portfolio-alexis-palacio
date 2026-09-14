import { test, expect } from '@playwright/test';

test.describe('Ask Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('generated answer with sources', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'generated',
          answer: 'Alexis is a Full Stack Developer.',
          sources: [
            { n: 1, title: 'Title 1', id: 'id1', score: 0.9 },
            { n: 2, title: 'Title 2', id: 'id2', score: 0.8 }
          ]
        })
      });
    });

    const input = page.locator('#ask-input');
    const submit = page.locator('#ask-submit');
    
    await input.fill('What does he do?');
    await submit.click();

    const answer = page.locator('#ask-answer-text');
    await expect(answer).toContainText('Alexis is a Full Stack Developer.');
    
    const sources = page.locator('#ask-sources-list li');
    await expect(sources).toHaveCount(2);
    await expect(sources.nth(0)).toHaveText('[1] Title 1');
    await expect(sources.nth(1)).toHaveText('[2] Title 2');
  });

  test('retrieval-only shows sources but no answer', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'retrieval-only',
          answer: null,
          sources: [
            { n: 1, title: 'Title 1', id: 'id1', score: 0.9 }
          ]
        })
      });
    });

    await page.locator('#ask-input').fill('Something?');
    await page.locator('#ask-submit').click();

    await expect(page.locator('#ask-answer-text')).toBeEmpty();
    await expect(page.locator('#ask-related-text')).toBeVisible();
    await expect(page.locator('#ask-sources-list li')).toHaveCount(1);
  });

  test('no-context shows default text and no sources', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'no-context',
          answer: null,
          sources: []
        })
      });
    });

    await page.locator('#ask-input').fill('Something obscure?');
    await page.locator('#ask-submit').click();

    const answerText = await page.locator('#ask-answer-text').textContent();
    expect(answerText).toContain('alexis26-93@live.com');
    await expect(page.locator('#ask-sources-container')).toBeHidden();
  });

  test('429 rate limit', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limited' })
      });
    });

    await page.locator('#ask-input').fill('Spam?');
    await page.locator('#ask-submit').click();

    await expect(page.locator('#ask-answer-text')).toContainText('Too many questions right now.');
  });

  test('clicking a suggestion submits the form', async ({ page }) => {
    let questionSent = '';
    await page.route('**/api/ask', async (route) => {
      questionSent = route.request().postDataJSON().question;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'generated', answer: 'Sure.', sources: [] })
      });
    });

    const chip = page.locator('.ask-chip').first();
    const chipText = await chip.textContent();
    await chip.click();

    await expect(page.locator('#ask-answer-text')).toHaveText('Sure.');
    expect(questionSent).toBe(chipText);
  });

  // Regression: chips stayed clickable during a request, firing parallel
  // requests whose answers overwrote each other.
  test('suggestions are disabled and ignored while a request is in flight', async ({ page }) => {
    let calls = 0;
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/api/ask', async (route) => {
      calls++;
      await pending;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'generated', answer: 'First answer.', sources: [] }),
      });
    });

    const chips = page.locator('.ask-chip');
    await chips.nth(0).click();
    await expect(chips.nth(1)).toBeDisabled();
    await chips.nth(1).click({ force: true });
    release();

    await expect(page.locator('#ask-answer-text')).toHaveText('First answer.');
    await expect(chips.nth(1)).toBeEnabled();
    expect(calls).toBe(1);
  });

  test('XSS prevention: renders HTML as text', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'generated',
          answer: '<img src=x onerror=alert(1)>',
          sources: []
        })
      });
    });

    await page.locator('#ask-input').fill('XSS?');
    await page.locator('#ask-submit').click();

    // Check that there is no img element
    await expect(page.locator('#ask-answer-container img')).toHaveCount(0);
    // Check that it's rendered as text
    await expect(page.locator('#ask-answer-text')).toHaveText('<img src=x onerror=alert(1)>');
  });

  test('Spanish toggle updates messages correctly', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limited' })
      });
    });

    // Ask a question in English
    await page.locator('#ask-input').fill('Spam?');
    await page.locator('#ask-submit').click();
    await expect(page.locator('#ask-answer-text')).toContainText('Too many questions');

    // Switch to Spanish
    await page.locator('#lang-btn-es').click();
    await expect(page.locator('#ask-input')).toHaveAttribute('placeholder', /Pregunta sobre mi experiencia/);

    // Ask again, should get Spanish error
    await page.locator('#ask-submit').click();
    await expect(page.locator('#ask-answer-text')).toContainText('Demasiadas preguntas');
  });

  // Regression: on a 402px-wide phone (iPhone 16 Pro) the input's intrinsic
  // min width pushed the "Ask" button 17px past the viewport.
  test('ask button fits inside a phone-width viewport in both languages', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 402, height: 874 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    await page.goto('/');
    for (const lang of ['en', 'es']) {
      if (lang === 'es') await page.locator('#lang-btn-es').click();
      const right = await page.evaluate(
        () => document.querySelector('#ask-submit')!.getBoundingClientRect().right,
      );
      expect(right, `button right edge (${lang})`).toBeLessThanOrEqual(402);
    }
    await context.close();
  });
});
