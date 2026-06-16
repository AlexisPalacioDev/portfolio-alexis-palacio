/**
 * Pure, testable deck slot math.
 * Used both at SSR time (Work.astro frontmatter) and at runtime (ProjectDeck island).
 * No DOM, no side-effects — import freely in Vitest and Astro.
 */

export interface SlotGeometry {
  /** Visual slot index: 0 = front, N-1 = back-most visible */
  s: number;
  /** X translate in px */
  tx: number;
  /** Y translate in px */
  ty: number;
  /** CSS scale (1.0 at front, decreasing toward back) */
  scale: number;
  /** Hidden when slot > 3 */
  hidden: boolean;
  /** z-index — higher value renders on top */
  zIndex: number;
  /** True when this card is the active front card */
  isFront: boolean;
}

/**
 * Compute the visual slot geometry for a single card.
 *
 * @param index  - Card's index in the work[] array (0-based)
 * @param active - Currently active (front) card index
 * @param total  - Total number of cards (N)
 */
export function computeSlot(index: number, active: number, total: number): SlotGeometry {
  const s = ((index - active) % total + total) % total;
  return {
    s,
    tx: s * 42,
    ty: s * 16,
    scale: 1 - s * 0.055,
    hidden: s > 3,
    zIndex: total - s,
    isFront: s === 0,
  };
}

/**
 * Build a CSS transform string from slot geometry.
 * Includes skewY(-3deg) for the card-fan aesthetic.
 */
export function buildCardTransform(g: SlotGeometry): string {
  return `translate(${g.tx}px, ${g.ty}px) scale(${g.scale}) skewY(-3deg)`;
}
