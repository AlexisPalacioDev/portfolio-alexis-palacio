/**
 * reveals.ts — fade + translateY reveal for elements with class `.rev`.
 *
 * Initial state (set by this module on boot): opacity: 0, translateY(32px).
 * On intersection: transition to opacity: 1, translateY(0).
 * Staggered by DOM order (each .rev gets an incremental delay).
 *
 * 3-second failsafe: if IntersectionObserver doesn't fire (e.g., the element
 * was already in the viewport on load, or IO is unsupported), force-reveal
 * all .rev elements after 3s.
 *
 * Spec: CAP-11 "Scroll reveals" + "Failsafe reveals all after 3 s"
 */

const TRANSITION_BASE = 'opacity 0.55s ease, transform 0.55s ease';
const STAGGER_MS = 80; // delay between sibling .rev elements

export function initReveals(): void {
  const revEls = Array.from(document.querySelectorAll<HTMLElement>('.rev'));
  if (revEls.length === 0) return;

  // ── Respect prefers-reduced-motion ────────────────────────────────────────
  // When the user has requested reduced motion, skip all animations and reveal
  // elements immediately without any translateY or transition.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.dataset.revRevealed = 'true';
    });
    return;
  }

  // ── Set initial hidden state ──────────────────────────────────────────────
  revEls.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = TRANSITION_BASE;
    el.dataset.revReady = 'true'; // mark so failsafe can identify hidden ones
  });

  // ── Reveal helper ─────────────────────────────────────────────────────────
  function reveal(el: HTMLElement, delay: number): void {
    if (el.dataset.revRevealed === 'true') return; // idempotent
    el.dataset.revRevealed = 'true';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  }

  // ── IntersectionObserver ─────────────────────────────────────────────────
  // Group elements by their nearest section parent so stagger resets per section.
  const sectionMap = new Map<Element | null, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        // Count siblings already revealed in same section for stagger offset
        const section = el.closest('section') ?? document.body;
        const currentCount = sectionMap.get(section) ?? 0;
        sectionMap.set(section, currentCount + 1);
        reveal(el, currentCount * STAGGER_MS);
        observer.unobserve(el);
      }
    },
    {
      rootMargin: '0px 0px -60px 0px', // trigger slightly before full entry
      threshold: 0.1,
    }
  );

  revEls.forEach((el) => observer.observe(el));

  // ── 3-second failsafe ─────────────────────────────────────────────────────
  setTimeout(() => {
    revEls.forEach((el, i) => {
      if (el.dataset.revRevealed !== 'true') {
        reveal(el, i * STAGGER_MS);
      }
    });
  }, 3000);
}
