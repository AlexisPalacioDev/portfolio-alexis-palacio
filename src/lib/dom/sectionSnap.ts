/**
 * sectionSnap.ts — buttery, eased wheel-driven section snapping.
 *
 * Native CSS scroll-snap snaps instantly with no control over speed, so we
 * drive the motion ourselves: one wheel gesture glides to the next/previous
 * <section> over ~900ms with an ease-in-out curve.
 *
 * Hardening (why this is more than a naive wheel hijack):
 * - During the tween we force `scroll-behavior: auto` on <html> so the CSS
 *   `scroll-behavior: smooth` (kept for nav anchor clicks) can't fight our
 *   per-frame scrollTo. Relying on `behavior:'instant'` alone is not enough —
 *   some engines ignore it and fall back to the CSS smooth scroll.
 * - Trackpad momentum keeps firing wheel events for up to ~1s after a flick.
 *   A fixed cooldown lets that tail trigger a second snap (skipping a section).
 *   Instead we stay "cooling down" and RE-ARM the release on every wheel event,
 *   so the lock only lifts once the wheel actually goes quiet.
 * - Sections taller than the viewport stay readable: we let native scroll run
 *   until the viewport reaches the section's top/bottom edge, then snap. Going
 *   up into a tall section lands at its BOTTOM (symmetric with reading down).
 * - All geometry (offsetTop/offsetHeight/innerHeight) is read live per gesture,
 *   so it survives layout shifts, lazy images and window resizes.
 * - Disabled for prefers-reduced-motion and narrow/touch viewports.
 */

const DURATION = 900; // ms — deliberately slow & smooth
const QUIET_MS = 140; // wheel must be silent this long after a snap before the next one

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function initSectionSnap(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Only hijack precise-pointer, desktop-width viewports. Touch keeps native scroll.
  if (!window.matchMedia('(min-width: 880px)').matches) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
  if (sections.length < 2) return;

  const html = document.documentElement;
  let animating = false; // an eased tween is currently running
  let coolingDown = false; // tween finished; absorbing trailing momentum
  let releaseTimer = 0;

  const busy = (): boolean => animating || coolingDown;

  function armRelease(): void {
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      coolingDown = false;
    }, QUIET_MS);
  }

  function targetTop(s: HTMLElement): number {
    return Math.max(0, s.offsetTop);
  }

  // Where to land when ENTERING a section. Down → its top (read downward). Up →
  // if it's taller than the viewport, its BOTTOM so you can scroll up through it.
  function enterTarget(s: HTMLElement, dir: number): number {
    if (dir < 0 && s.offsetHeight > window.innerHeight) {
      return Math.max(0, s.offsetTop + s.offsetHeight - window.innerHeight);
    }
    return targetTop(s);
  }

  function animateTo(y: number): void {
    const startY = window.scrollY;
    const dist = y - startY;
    if (Math.abs(dist) < 2) return; // already there — don't lock for nothing

    animating = true;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto'; // our easing owns the motion this whole tween
    let startTs: number | null = null;

    function step(ts: number): void {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / DURATION);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        html.style.scrollBehavior = prevScrollBehavior;
        animating = false;
        coolingDown = true;
        armRelease(); // lift the lock only once the wheel goes quiet
      }
    }
    requestAnimationFrame(step);
  }

  function currentIndex(): number {
    const probe = window.scrollY + 10;
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) idx = i;
    }
    return idx;
  }

  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (busy()) {
        // Swallow everything while locked. If we're past the tween and just
        // absorbing momentum, keep re-arming so the lock outlasts the flick.
        e.preventDefault();
        if (coolingDown && !animating) armRelease();
        return;
      }

      // Ignore tiny / horizontal-dominant deltas.
      if (Math.abs(e.deltaY) < 4) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const idx = currentIndex();
      const cur = sections[idx];

      // Inside a section taller than the viewport: let native scroll reveal it,
      // snapping only once the viewport hits the section's top/bottom edge.
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
