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
// `:not(.bh-char)` matters: without it every span we just created becomes a
// candidate on the next harvest, so the candidate set (and the layout reads it
// costs) grows with every round.
const TARGET_SELECTOR =
  'h1, h2, h3, h4, p, li, a, span:not(.bh-char), blockquote, figcaption';

// Skip very long blocks: per-char inline-block spans can shift wrapping, and a
// paragraph of 300 chars is both ugly to eat and heavier to restore.
const MAX_TEXT_LENGTH = 42;
const MIN_TEXT_LENGTH = 8;

// Hard ceiling on how many un-eaten glyphs may exist at once.
//
// Every live span is an inline-block inside a paragraph, so it takes part in
// line layout — and the bug triggers a layout on nearly every bite. Measured on
// this page: 122 live spans tripled the cost of a full layout pass (19ms → 57ms).
// The bug eats roughly one glyph per 750ms, so a few dozen is already several
// minutes of food; more than that is pure layout tax for something nobody sees.
const MAX_LIVE_CHARS = 48;

// Original innerHTML per touched element, so restore is exact. A plain Map is
// fine: it lives only for the duration of one game and is cleared on restore.
const originals = new Map<HTMLElement, string>();

// Glyphs the bug has swallowed this round, in order — so the explosion can spit
// them back out. Cleared on restore.
const eaten: string[] = [];

/**
 * Cheap half of the edibility test — everything that needs no layout.
 * Kept separate from the geometry check so `harvestTargets` can do all its
 * layout reads in one batch instead of interleaving them with DOM writes.
 */
function isEdibleShape(el: HTMLElement): boolean {
  if (el.children.length > 0) return false; // not a plain-text leaf — skip
  if (originals.has(el)) return false; // already split
  if (el.closest('[data-bh-skip]')) return false; // opt-out hook
  if (el.closest('nav')) return false; // leave navigation intact

  const text = el.textContent?.trim() ?? '';
  // A 1-2 character label (an icon, a number) is a whole element split for
  // almost no food — the bug runs dry while the layout still pays for it.
  return text.length >= MIN_TEXT_LENGTH && text.length <= MAX_TEXT_LENGTH;
}

/** Geometry half — needs layout, so callers must batch it. */
function isOnScreen(rect: DOMRect): boolean {
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
    // No `will-change` here on purpose. These spans number in the hundreds and
    // promoting every one of them to its own compositor layer costs far more
    // than the transition it would smooth. `eatChar` opts a glyph in for the
    // ~200 ms it actually animates, then drops it again.
    frag.appendChild(span);
  }

  el.replaceChildren(frag);
}

/**
 * Find up to `max` edible elements inside `main` and split them into chars.
 * Idempotent: already-split elements are skipped. Returns how many were added.
 */
export function harvestTargets(max: number): number {
  // Budget check first — the cheapest way to split fewer elements is to notice
  // there is still food on the plate.
  const alive = document.querySelectorAll(`.${CHAR_CLASS}:not([${EATEN_ATTR}])`).length;
  if (alive >= MAX_LIVE_CHARS) return 0;

  const root = document.querySelector('main') ?? document.body;
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR));

  // Phase 1 — cheap filter, no layout involved. DOM order is deliberate: it
  // keeps the bug eating its way down the page the way it always did.
  const shortlist = candidates.filter(isEdibleShape);

  // Phase 2 — all layout reads together. Splitting an element invalidates
  // layout, so a read/write/read loop forces a full reflow per candidate and
  // turns this into a 50-120 ms long task. Batching keeps it to one reflow.
  const picked: HTMLElement[] = [];
  let budget = MAX_LIVE_CHARS - alive;
  for (const el of shortlist) {
    if (picked.length >= max || budget <= 0) break;
    if (!isOnScreen(el.getBoundingClientRect())) continue;
    picked.push(el);
    budget -= el.textContent?.length ?? 0;
  }

  // Phase 3 — writes only.
  for (const el of picked) splitElement(el);
  return picked.length;
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
  // Promote just this one glyph, just while it moves.
  span.style.willChange = 'transform, opacity';
  // Next frame so the transition actually runs.
  requestAnimationFrame(() => {
    // Sucked up toward the bug's mouth (which hovers just above) while shrinking.
    span.style.transform = 'translateY(-9px) scale(0) rotate(16deg)';
    span.style.opacity = '0';
  });
  window.setTimeout(() => {
    span.style.display = 'none';
    span.style.willChange = 'auto'; // give the layer back
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
