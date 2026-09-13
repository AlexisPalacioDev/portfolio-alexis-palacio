import { describe, it, expect } from 'vitest';
import { cosineTopK, normalize } from '../../../rag/lib/vector.ts';

describe('vector math', () => {
  // guards: minScore strictly filters results regardless of k
  it('filters results exclusively by minScore when k is large', () => {
    const q = normalize([1, 0]);
    const chunks = [
      { id: '1', title: '', text: '', vector: normalize([1, 0]) }, // score 1.0
      { id: '2', title: '', text: '', vector: normalize([0.9, 0.1]) }, // score > 0.8
      { id: '3', title: '', text: '', vector: normalize([0.1, 0.9]) }, // score < 0.5
      { id: '4', title: '', text: '', vector: normalize([-1, 0]) } // score -1.0
    ];
    
    const results = cosineTopK(q, chunks, 10, 0.8);
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
  });
});
