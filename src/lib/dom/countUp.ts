/**
 * countUp.ts — animates stat tile numbers from 0 to their target once when
 * the About section enters the viewport.
 *
 * Target values are read from `data-count` attributes on each StatTile.
 * The animation runs for ~1200ms using an ease-out curve.
 * After completion, the observer is disconnected — animation never replays.
 *
 * Spec: CAP-04 "Count-up triggers on first scroll into view" + "does not replay"
 */

const DURATION_MS = 1200;

/**
 * Ease-out cubic: fast start, slows toward the end.
 * Exported for unit testing.
 */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Interpolate from 0 to target using ease-out over duration.
 * Returns the integer value at time t (0..1).
 * Exported for unit testing.
 */
export function interpolateCount(target: number, t: number): number {
  return Math.round(easeOutCubic(Math.min(1, t)) * target);
}

export function initCountUp(): void {
  const tiles = Array.from(
    document.querySelectorAll<HTMLElement>('[data-count]')
  );
  if (tiles.length === 0) return;

  // ── Animation runner ──────────────────────────────────────────────────────
  function animateTile(el: HTMLElement, target: number): void {
    const start = performance.now();
    // Keep original display text suffix (e.g., "+" in "20+")
    // The element textContent at SSR time is the final value like "5+".
    // We store the suffix so we can append it during animation.
    const originalText = el.textContent ?? '';
    const suffix = originalText.replace(/^\d+/, ''); // strip leading digits → "+"

    function step(now: number): void {
      const elapsed = now - start;
      const t = elapsed / DURATION_MS;
      const current = interpolateCount(target, t);
      el.textContent = `${current}${suffix}`;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure final value is exact
        el.textContent = `${target}${suffix}`;
      }
    }
    requestAnimationFrame(step);
  }

  // ── IntersectionObserver: trigger once when About enters view ─────────────
  let triggered = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || triggered) continue;
        triggered = true;
        observer.disconnect(); // one-shot: never replay

        tiles.forEach((tile) => {
          const target = parseInt(tile.dataset.count ?? '0', 10);
          if (!isNaN(target) && target > 0) {
            animateTile(tile, target);
          }
        });
      }
    },
    { threshold: 0.3 } // trigger when 30% of About section is visible
  );

  // Observe the About section (or fallback: the first tile's closest section)
  const aboutSection =
    document.getElementById('about') ??
    tiles[0]?.closest('section') ??
    null;

  if (aboutSection) {
    observer.observe(aboutSection);
  }
}
