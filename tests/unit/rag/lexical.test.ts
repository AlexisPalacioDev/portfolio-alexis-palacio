import { describe, it, expect } from 'vitest';
import { BM25, tokenize } from '../../../rag/lib/lexical.ts';

describe('lexical retrieval', () => {
  // guards: tokenizer is diacritic-insensitive and ignores stopwords
  it('tokenizes correctly', () => {
    const tokens = tokenize('El niño jugaba rápido y en la calle.');
    expect(tokens).toEqual(['nino', 'jugaba', 'rapido', 'calle']);
  });

  // guards: exact keyword matching works and ranks correctly
  it('ranks keyword matches first', () => {
    const bm25 = new BM25([
      { id: '1', title: 'React', text: 'I know Vue and Angular' },
      { id: '2', title: 'Skills', text: 'I know react, react, react very well' }
    ]);
    const results = bm25.score('react');
    expect(results[0].id).toBe('2');
  });

  // guards: IDF — a rare term outweighs a term present in every document
  it('weights rare terms above common ones', () => {
    const bm25 = new BM25([
      // Without IDF, repeating the common term would win on term frequency.
      { id: 'common', title: 'x', text: 'developer developer' },
      { id: 'rare', title: 'x', text: 'playwright tool' },
      { id: 'other', title: 'x', text: 'developer vitest' },
    ]);
    expect(bm25.score('developer playwright')[0].id).toBe('rare');
  });
});
