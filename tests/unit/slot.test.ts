import { describe, it, expect } from 'vitest';
import { computeSlot, buildCardTransform } from '../../src/lib/deck/slot';

const N = 7;

describe('computeSlot()', () => {
  describe('front card (active = 0)', () => {
    it('card 0 is at slot 0 (front) when active=0', () => {
      const g = computeSlot(0, 0, N);
      expect(g.s).toBe(0);
      expect(g.isFront).toBe(true);
      expect(g.hidden).toBe(false);
    });

    it('card 1 is at slot 1 when active=0', () => {
      expect(computeSlot(1, 0, N).s).toBe(1);
    });

    it('card 6 is at slot 6 when active=0 (per CAP-13 edge case)', () => {
      const g = computeSlot(6, 0, N);
      expect(g.s).toBe(6);
      expect(g.hidden).toBe(true);
    });
  });

  describe('active = 2 (per CAP-06 scenario)', () => {
    it('card 2 is at slot 0 (front) when active=2', () => {
      const g = computeSlot(2, 2, N);
      expect(g.s).toBe(0);
      expect(g.isFront).toBe(true);
    });

    it('card 3 is at slot 1 when active=2', () => {
      expect(computeSlot(3, 2, N).s).toBe(1);
    });

    it('card 1 is at slot 6 (hidden) when active=2', () => {
      const g = computeSlot(1, 2, N);
      expect(g.s).toBe(6);
      expect(g.hidden).toBe(true);
    });
  });

  describe('wrap-around (active = N-1)', () => {
    it('card 0 is at slot 1 when active=6 (per CAP-13 edge case)', () => {
      const g = computeSlot(0, N - 1, N);
      expect(g.s).toBe(1);
    });

    it('card 6 is at slot 0 (front) when active=6', () => {
      const g = computeSlot(6, N - 1, N);
      expect(g.s).toBe(0);
      expect(g.isFront).toBe(true);
    });
  });

  describe('hidden rule', () => {
    it('cards with slot > 3 are hidden', () => {
      for (let i = 0; i < N; i++) {
        const g = computeSlot(i, 0, N);
        if (g.s > 3) {
          expect(g.hidden).toBe(true);
        } else {
          expect(g.hidden).toBe(false);
        }
      }
    });

    it('cards at slots 4, 5, 6 are hidden when active=0', () => {
      [4, 5, 6].forEach((i) => {
        expect(computeSlot(i, 0, N).hidden).toBe(true);
      });
    });
  });

  describe('z-index ordering', () => {
    it('front card has highest z-index', () => {
      const front = computeSlot(0, 0, N);
      expect(front.zIndex).toBe(N);
    });

    it('z-index decreases as slot increases', () => {
      for (let i = 0; i < N - 1; i++) {
        const a = computeSlot(i, 0, N);
        const b = computeSlot(i + 1, 0, N);
        expect(a.zIndex).toBeGreaterThan(b.zIndex);
      }
    });
  });

  describe('transform geometry', () => {
    it('front card has zero translate and full scale', () => {
      const g = computeSlot(0, 0, N);
      expect(g.tx).toBe(0);
      expect(g.ty).toBe(0);
      expect(g.scale).toBe(1);
    });

    it('slot 1 card has tx=42, ty=16, scale=0.945', () => {
      const g = computeSlot(1, 0, N);
      expect(g.tx).toBe(42);
      expect(g.ty).toBe(16);
      expect(g.scale).toBeCloseTo(1 - 0.055);
    });

    it('scale is monotonically decreasing with slot', () => {
      for (let i = 0; i < N - 1; i++) {
        const a = computeSlot(i, 0, N);
        const b = computeSlot(i + 1, 0, N);
        expect(a.scale).toBeGreaterThan(b.scale);
      }
    });
  });

  describe('full cycle invariant', () => {
    it('every index maps to a unique slot when active=0', () => {
      const slots = Array.from({ length: N }, (_, i) => computeSlot(i, 0, N).s);
      const unique = new Set(slots);
      expect(unique.size).toBe(N);
    });
  });
});

describe('buildCardTransform()', () => {
  it('returns correct CSS transform for front card', () => {
    const g = computeSlot(0, 0, N);
    const result = buildCardTransform(g);
    expect(result).toBe('translate(0px, 0px) scale(1) skewY(-3deg)');
  });

  it('returns correct CSS transform for slot 1', () => {
    const g = computeSlot(1, 0, N);
    const result = buildCardTransform(g);
    expect(result).toContain('translate(42px, 16px)');
    expect(result).toContain('skewY(-3deg)');
  });
});
