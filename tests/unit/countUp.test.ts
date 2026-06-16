import { describe, it, expect } from 'vitest';
import { easeOutCubic, interpolateCount } from '../../src/lib/dom/countUp';

describe('easeOutCubic()', () => {
  it('returns 0 at t=0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 at t=1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('is strictly monotonically increasing for t in [0,1]', () => {
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      expect(easeOutCubic(t0)).toBeLessThan(easeOutCubic(t1));
    }
  });

  it('is always in [0, 1] for t in [0, 1]', () => {
    for (let i = 0; i <= 10; i++) {
      const v = easeOutCubic(i / 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('at t=0.5 is greater than 0.5 (ease-out is faster early)', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('interpolateCount()', () => {
  it('returns 0 at t=0', () => {
    expect(interpolateCount(20, 0)).toBe(0);
  });

  it('returns target at t=1', () => {
    expect(interpolateCount(20, 1)).toBe(20);
    expect(interpolateCount(5, 1)).toBe(5);
    expect(interpolateCount(16, 1)).toBe(16);
  });

  it('clamps at t>1 to target', () => {
    expect(interpolateCount(16, 2)).toBe(16);
  });

  it('returns a value between 0 and target at t=0.5', () => {
    const v = interpolateCount(20, 0.5);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(20);
  });

  it('returns integer values (rounded)', () => {
    // At any mid-point, result should be an integer (not fractional)
    for (let i = 0; i <= 10; i++) {
      const v = interpolateCount(7, i / 10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('stat tile targets: 5, 20, 16 all reach exact final values at t=1', () => {
    expect(interpolateCount(5, 1)).toBe(5);
    expect(interpolateCount(20, 1)).toBe(20);
    expect(interpolateCount(16, 1)).toBe(16);
  });
});
