import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('cv-nuevo.html — portfolio link', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../../public/cv-nuevo.html', import.meta.url)),
    'utf-8'
  );

  it('links to the current Vercel portfolio URL', () => {
    expect(html).toContain('https://portfolio-alexis-palacio.vercel.app');
  });

  it('does not reference the stale alexispalacio.dev domain', () => {
    expect(html).not.toContain('alexispalacio.dev');
  });
});
