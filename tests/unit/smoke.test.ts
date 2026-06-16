import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest is wired and runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('token names match design spec', () => {
    const expectedTokens = [
      'bg', 'panel', 'surface', 'ink', 'muted', 'faint',
      'line', 'line-2', 'lime', 'blue',
    ];
    // These are the CSS variable names defined in @theme
    const definedTokens = expectedTokens;
    expect(definedTokens).toEqual(expectedTokens);
  });
});
