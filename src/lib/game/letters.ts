/**
 * letters.ts — the "edible text" layer for the bug-hunt game.
 *
 * The bug eats real on-screen text, so this module owns the SAFETY CONTRACT:
 *
 *  1. We only ever touch elements whose content is PLAIN TEXT (no child
 *     elements). That guarantees we never destroy nested markup, links, icons,
 *     or i18n hooks — we only rewrite leaf text nodes.
 *  2. Before splitting an element we snapshot its original `innerHTML`. Calling
 *     `restoreAll()` puts every touched element back to byte-for-byte original.
 *  3. The eaten state is a transient VISUAL gag. The whole game is gated on
 *     `prefers-reduced-motion: no-preference` and pointer:fine by the caller,
 *     and the game layer is aria-hidden, so this never reaches assistive tech.
 *
 * Nothing here animates the bug or knows about weapons — it just exposes the
 * primitives the controller drives: harvest → list live chars → eat → restore.
 */

const CHAR_CLASS = 'bh-char';
const EATEN_ATTR = 'data-bh-eaten';

// Elements we consider "text" worth eating. Headings first — they are short, so
// splitting them into inline-block chars barely disturbs layout.
const TARGET_SELECTOR = 'h1, h2, h3, h4, p, li, a, span, blockquote, figcaption';

// Skip very long blocks: per-char inline-block spans can shift wrapping, and a
// paragraph of 300 chars is both ugly to eat and heavier to restore.
const MAX_TEXT_LENGTH = 90;

// Original innerHTML per touched element, so restore is exact. A plain Map is
// fine: it lives only for the duration of one game and is cleared on restore.
const originals = new Map<HTMLElement, string>();

// Glyphs the bug has swallowed this round, in order — so the explosion can spit
// them back out. Cleared on restore.
const eaten: string[] = [];

/** Is this element a safe, visible, plain-text leaf we can eat? */
function isEdible(el: HTMLElement): boolean {
  if (el.children.length > 0) return false; // not a plain-text leaf — skip
  if (originals.has(el)) return false; // already split
  if (el.closest('[data-bh-skip]')) return false; // opt-out hook
  if (el.closest('nav')) return false; // leave navigation intact

  const text = el.textContent?.trim() ?? '';
  if (text.length === 0 || text.length > MAX_TEXT_LENGTH) return false;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  // Must be at least partially inside the viewport.
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  return rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
}

/** Replace an element's text with one `<span class="bh-char">` per character. */
function splitElement(el: HTMLElement): void {
  originals.set(el, el.innerHTML);

  const text = el.textContent ?? '';
  const frag = document.createDocumentFragment();

  for (const char of text) {
    // Preserve whitespace as plain text so words keep their gaps.
    if (char === ' ' || char === '\n' || char === '\t') {
      frag.appendChild(document.createTextNode(char));
      continue;
    }
    const span = document.createElement('span');
    span.className = CHAR_CLASS;
    span.textContent = char;
    // inline-block lets us scale the glyph to 0 when it is eaten.
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    frag.appendChild(span);
  }

  el.replaceChildren(frag);
}

/**
 * Find up to `max` edible elements inside `main` and split them into chars.
 * Idempotent: already-split elements are skipped. Returns how many were added.
 */
export function harvestTargets(max: number): number {
  const root = document.querySelector('main') ?? document.body;
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR));

  let added = 0;
  for (const el of candidates) {
    if (added >= max) break;
    if (!isEdible(el)) continue;
    splitElement(el);
    added += 1;
  }
  return added;
}

/** All char spans that are still on the plate (visible, not yet eaten). */
export function liveChars(): HTMLElement[] {
  const spans = Array.from(
    document.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}:not([${EATEN_ATTR}])`)
  );
  return spans.filter((span) => {
    const rect = span.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return rect.bottom > 0 && rect.top < window.innerHeight;
  });
}

/** Viewport-space center of a char span. */
export function charCenter(span: HTMLElement): { x: number; y: number } {
  const rect = span.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Animate a single char being eaten, then collapse it so text reflows. */
export function eatChar(span: HTMLElement): void {
  span.setAttribute(EATEN_ATTR, '1');
  eaten.push(span.textContent ?? '');
  span.style.transformOrigin = 'center';
  span.style.transition = 'transform .2s ease-in, opacity .2s ease-in';
  // Next frame so the transition actually runs.
  requestAnimationFrame(() => {
    // Sucked up toward the bug's mouth (which hovers just above) while shrinking.
    span.style.transform = 'translateY(-9px) scale(0) rotate(16deg)';
    span.style.opacity = '0';
  });
  window.setTimeout(() => {
    span.style.display = 'none';
  }, 210);
}

/**
 * Put every touched element back to its exact original HTML and give it a brief
 * "pop" so the returning letters feel celebratory. Clears all internal state.
 */
export function restoreAll(): void {
  originals.forEach((html, el) => {
    el.innerHTML = html;
    // Web Animations API: self-cleaning, no leftover inline styles or keyframes.
    el.animate(
      [
        { opacity: 0.2, transform: 'scale(0.94)' },
        { opacity: 1, transform: 'scale(1.04)', offset: 0.7 },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  });
  originals.clear();
  eaten.length = 0;
}

/** The glyphs swallowed so far this round (a copy), for the explosion to spit out. */
export function eatenGlyphs(): string[] {
  return eaten.filter((ch) => ch.trim().length > 0);
}

/** True if any element is currently split (i.e. a game is in progress). */
export function hasActiveTargets(): boolean {
  return originals.size > 0;
}
