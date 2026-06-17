import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('smoke', () => {
  it('vitest is wired and runs', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('design tokens', () => {
  // Actually parse the stylesheet instead of comparing a list to itself —
  // this fails if a --color-* token is renamed or removed from @theme.
  const css = readFileSync(
    fileURLToPath(new URL('../../src/styles/global.css', import.meta.url)),
    'utf-8'
  );

  const expectedTokens = [
    'bg', 'panel', 'surface', 'ink', 'muted', 'faint',
    'line', 'line-2', 'lime', 'blue',
  ];

  it.each(expectedTokens)('defines --color-%s in @theme', (name) => {
    expect(css).toMatch(new RegExp(`--color-${name}\\s*:`));
  });

  it('defines the font-family tokens', () => {
    expect(css).toMatch(/--font-display\s*:/);
    expect(css).toMatch(/--font-mono\s*:/);
  });
});
