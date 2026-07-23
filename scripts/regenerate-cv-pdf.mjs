// Regenerates public/Alexis-Palacio-CV.pdf from public/cv-nuevo.html.
//
// Usage:
//   npm run cv:pdf
//   # or, pointing at a different host/port:
//   CV_URL=http://localhost:4321/cv-nuevo.html node scripts/regenerate-cv-pdf.mjs
//
// Requires a running server that serves public/cv-nuevo.html (e.g. `npm run dev`
// or `npm run preview`), so the page's Google Fonts (Inter) request resolves
// exactly like it would for a real visitor. Requires network access — if the
// Inter font fails to load, the browser falls back to a different font and the
// output PDF will visually drift from the current one. Re-run once online
// rather than shipping a drifted PDF.

import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CV_URL = process.env.CV_URL ?? 'http://localhost:4321/cv-nuevo.html';
const OUTPUT_PATH = resolve(
  fileURLToPath(new URL('..', import.meta.url)),
  'public/Alexis-Palacio-CV.pdf'
);

async function main() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(CV_URL, { waitUntil: 'networkidle' });

    // Ensure the Inter webfont (loaded via @import in <style>) is fully
    // downloaded and applied before printing, not just "requested".
    await page.evaluate(() => document.fonts.ready);

    // The CV stylesheet has no @media print rules, so force screen media to
    // preserve the same colors/backgrounds a visitor sees on screen.
    await page.emulateMedia({ media: 'screen' });

    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1,
      preferCSSPageSize: false,
    });

    console.log(`CV PDF regenerated: ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
