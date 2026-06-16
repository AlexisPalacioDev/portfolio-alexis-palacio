/**
 * scrollProgress.ts — wires the #scroll-progress bar width to page scroll position.
 *
 * The DOM element is rendered in BaseLayout.astro with width: 0%.
 * This module reads scrollTop / scrollHeight each scroll event and updates width.
 *
 * Uses a rAF flag to avoid layout thrash when the user scrolls fast.
 *
 * Spec: CAP-02 "Scroll-progress bar reflects position"
 */

export function initScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  let ticking = false;

  function update(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar!.style.width = '0%';
      return;
    }
    const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    bar!.style.width = `${pct}%`;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Run once on load so bar starts at correct position on refresh mid-page
  update();
}
