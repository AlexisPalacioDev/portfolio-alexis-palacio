/**
 * sectionSnap.ts — buttery, eased wheel-driven section snapping.
 *
 * Native CSS `scroll-snap-type: mandatory` snaps instantly and gives no control
 * over speed — it felt too abrupt. This replaces it with a slow, eased glide to
 * the next/previous <section> on a wheel gesture.
 *
 * Behaviour:
 * - A wheel gesture commits to exactly one section, animated over ~900ms.
 * - Sections taller than the viewport stay readable: we only snap once the
 *   viewport reaches the section's top/bottom edge; otherwise native scroll runs.
 * - Disabled for prefers-reduced-motion and for narrow/touch viewports (which
 *   keep their natural momentum scrolling).
 */

const NAV_OFFSET = 0; // sections snap flush; the fixed nav overlays each section's own top padding
const DURATION = 900; // ms — deliberately slow & smooth
const COOLDOWN = 160; // ms lock after a snap so trackpad momentum can't double-fire

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function initSectionSnap(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Only hijack precise-pointer, desktop-width viewports. Touch keeps native scroll.
  if (!window.matchMedia('(min-width: 880px)').matches) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
  if (sections.length < 2) return;

  let busy = false;

  function targetTop(s: HTMLElement): number {
    return Math.max(0, s.offsetTop - NAV_OFFSET);
  }

  // Where to land when ENTERING a section in a given direction.
  // Going down → land at its top and read downward. Going up → if the section
  // is taller than the viewport, land at its BOTTOM so you can scroll up
  // THROUGH it (symmetric with the downward read), otherwise its top.
  function enterTarget(s: HTMLElement, dir: number): number {
    if (dir < 0 && s.offsetHeight > window.innerHeight) {
      return Math.max(0, s.offsetTop + s.offsetHeight - window.innerHeight);
    }
    return targetTop(s);
  }

  function animateTo(y: number): void {
    busy = true;
    const startY = window.scrollY;
    const dist = y - startY;
    let startTs: number | null = null;

    function step(ts: number): void {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / DURATION);
      // behavior:instant — bypass CSS scroll-behavior:smooth so our easing owns the motion
      window.scrollTo({ top: startY + dist * easeInOutCubic(p), behavior: 'instant' as ScrollBehavior });
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        window.setTimeout(() => {
          busy = false;
        }, COOLDOWN);
      }
    }
    requestAnimationFrame(step);
  }

  function currentIndex(): number {
    const probe = window.scrollY + NAV_OFFSET + 10;
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) idx = i;
    }
    return idx;
  }

  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (busy) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const idx = currentIndex();
      const cur = sections[idx];

      // Let native scroll reveal the rest of a section taller than the viewport,
      // only snapping once we've reached its top (scrolling up) or bottom (down).
      const atTop = window.scrollY <= targetTop(cur) + 6;
      const atBottom = window.scrollY + window.innerHeight >= cur.offsetTop + cur.offsetHeight - 6;
      if (dir > 0 && !atBottom) return;
      if (dir < 0 && !atTop) return;

      const nextIdx = Math.min(sections.length - 1, Math.max(0, idx + dir));
      if (nextIdx === idx) return;

      e.preventDefault();
      animateTo(enterTarget(sections[nextIdx], dir));
    },
    { passive: false }
  );
}
