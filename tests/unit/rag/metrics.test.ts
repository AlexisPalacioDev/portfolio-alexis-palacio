import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../../../rag/lib/metrics.ts';

describe('calculateMetrics', () => {
  // guards: metrics calculation matches expected formulas
  it('calculates hit rates correctly', () => {
    const results = [
      { expected: ['a'], hitIds: ['a', 'b', 'c', 'd'], scores: [0.9, 0.8, 0.7, 0.6] },
      { expected: ['a'], hitIds: ['x', 'a', 'c', 'd'], scores: [0.9, 0.8, 0.7, 0.6] },
      { expected: ['a'], hitIds: ['x', 'y', 'z', 'w'], scores: [0.9, 0.8, 0.7, 0.6] },
    ];
    
    const m = calculateMetrics(results);
    // 1st is hit@1. 2nd is hit@4. 3rd is miss.
    expect(m.inScope.hitAt1).toBeCloseTo(0.333, 2);
    expect(m.inScope.hitAt4).toBeCloseTo(0.666, 2);
    // MRR: 1 + 0.5 + 0 = 1.5 / 3 = 0.5
    expect(m.inScope.mrr).toBeCloseTo(0.5, 2);
  });
});
