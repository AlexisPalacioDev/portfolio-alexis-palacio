import { describe, it, expect } from 'vitest';
import { retrieve } from '../../../rag/lib/retrieve.ts';
import { citedSources } from '../../../rag/lib/ask.ts';
import type { IndexData } from '../../../rag/lib/ask.ts';
import { normalize } from '../../../rag/lib/vector.ts';

function chunk(id: string, text: string, vector: number[]) {
  return { id, title: id, text, vector: normalize(vector) };
}

describe('retrieve (hybrid score fusion)', () => {
  // Guards the reason hybrid search exists: a chunk that only matches the exact
  // keyword must overtake a chunk that is marginally closer in embedding space.
  it('lets an exact keyword match overtake a slightly closer vector match', () => {
    const index: IndexData = {
      chunks: [
        chunk('vector-near', 'frontend skills with react', [1, 0.02, 0]),
        chunk('keyword', 'testing with playwright and vitest', [1, 0.06, 0]),
        chunk('far', 'cooking recipes', [0, 0, 1]),
      ],
    };
    const query = normalize([1, 0, 0]);

    const vectorOnly = retrieve(index, query, 'playwright', { lexicalWeight: 0, skipGate: true });
    expect(vectorOnly[0].id).toBe('vector-near');

    const hybrid = retrieve(index, query, 'playwright', { skipGate: true });
    expect(hybrid[0].id).toBe('keyword');
  });

  // Guards against the RRF regression: a weak keyword overlap must not flip a
  // clearly better semantic match.
  it('keeps a clearly better semantic match on top despite weak keyword overlap', () => {
    const index: IndexData = {
      chunks: [
        chunk('semantic', 'english b1 reads documentation', [1, 0, 0]),
        chunk('noise', 'routes for the level of the cast bridge', [0.3, 1, 0]),
      ],
    };
    const results = retrieve(index, normalize([1, 0, 0]), 'level', { skipGate: true });
    expect(results[0].id).toBe('semantic');
  });

  it('returns the cosine similarity as score, not the fused score', () => {
    const index: IndexData = { chunks: [chunk('a', 'playwright', [1, 0, 0])] };
    const [hit] = retrieve(index, normalize([1, 0, 0]), 'playwright', { skipGate: true });
    expect(hit.score).toBeCloseTo(1, 6);
  });

  it('returns at most k results', () => {
    const index: IndexData = {
      chunks: Array.from({ length: 10 }, (_, i) => chunk(`c${i}`, `text ${i}`, [1, i, 0])),
    };
    expect(retrieve(index, normalize([1, 0, 0]), 'text', { k: 3, skipGate: true })).toHaveLength(3);
  });

  describe('no-context gate', () => {
    const index: IndexData = {
      minScore: 0.5,
      minLexical: 0.1,
      chunks: [
        chunk('a', 'playwright vitest jest', [1, 0, 0]),
        chunk('b', 'kotlin compose android', [0, 1, 0]),
      ],
    };

    it('returns nothing when both cosine and BM25 are below their thresholds', () => {
      expect(retrieve(index, normalize([0, 0, 1]), 'weather today')).toEqual([]);
    });

    it('passes when only the cosine score clears its threshold', () => {
      expect(retrieve(index, normalize([1, 0, 0]), 'weather today').length).toBeGreaterThan(0);
    });

    it('passes when only the BM25 score clears its threshold', () => {
      expect(retrieve(index, normalize([0, 0, 1]), 'kotlin').length).toBeGreaterThan(0);
    });

    it('uses the default thresholds when the index does not define them', () => {
      const bare: IndexData = { chunks: [chunk('a', 'playwright', [1, 0, 0])] };
      // Cosine 0 < 0.25 and no keyword overlap: gated by the defaults.
      expect(retrieve(bare, normalize([0, 1, 0]), 'weather')).toEqual([]);
    });
  });
});

describe('citedSources', () => {
  const sources = [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }];

  it('keeps only the sources cited in the answer', () => {
    expect(citedSources('B1 level [3], reads docs [1][3].', sources)).toEqual([{ n: 1 }, { n: 3 }]);
  });

  it('falls back to every source when the answer cites none', () => {
    expect(citedSources('No citations here.', sources)).toEqual(sources);
  });

  it('ignores citation numbers that do not match any source', () => {
    expect(citedSources('See [9].', sources)).toEqual(sources);
  });
});
