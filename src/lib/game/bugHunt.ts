/**
 * bugHunt.ts — ambient pixel-art easter egg.
 *
 * After a stretch of inactivity a little white pixel fly flies in and starts
 * eating the page's letters one by one, fattening as it goes. A weapons menu
 * slides in from the right edge; pick the hammer, swing it at the bug, and on a
 * hit the bug explodes and every eaten letter snaps back into place.
 *
 * Design notes / guard rails (this is an easter egg on a real portfolio):
 *  - Runs ONLY on desktop pointers (`pointer: fine`) and when the user has not
 *    asked for reduced motion. Touch / reduced-motion users never see it.
 *  - Triggers only after genuine inactivity, and `Escape` kills it instantly.
 *  - All text mutation + restoration lives in letters.ts (exact restore).
 *  - A language switch (html[lang] change) tears the game down so we never
 *    restore stale text.
 *  - Everything created here is aria-hidden and removed on teardown — no DOM,
 *    listeners, or timers leak between rounds.
 *
 * Follows the project convention: a single exported `initBugHunt()` wired up in
 * BaseLayout.astro alongside the other src/lib/dom modules.
 */

import { bugSprite, hammerSprite, spraySprite, bugCell, PX } from './sprites';
import {
  harvestTargets,
  liveChars,
  charCenter,
  eatChar,
  restoreAll,
  eatenGlyphs,
} from './letters';

// ── Tunables ────────────────────────────────────────────────────────────────
const IDLE_MS = 9000; // inactivity before the bug appears
const COOLDOWN_MS = 12000; // quiet period after a round before it can return
const FLIGHT_MS = 520; // glide duration between letters
const EAT_PAUSE_MS = 230; // pause on a letter before moving on
const LETTERS_PER_STAGE = 6; // letters eaten per fatness bump (slow, deliberate)
const HAMMER_CHARGE_MS = 700; // hold-to-charge: time to reach a full-power swing
const MAX_STAGE = 5; // cap on fatness
const HARVEST_BATCH = 6; // elements split per refill
const MENU_DELAY_MS = 1600; // delay before the weapons menu slides in
const BASE_HIT_RADIUS = 46; // px; grows with the bug's fatness
const SPRAY_RANGE = 150; // px; how far the held aerosol reaches the fly
const SPRAY_INTERVAL_MS = 70; // puff cadence while the trigger is held

type State = 'idle' | 'active' | 'cooldown';

export function initBugHunt(): void {
  // Server-safe guard (Astro bundles this as a module script, but be defensive).
  if (typeof window === 'undefined') return;

  const finePointer = window.matchMedia('(pointer: fine)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  // Touch devices: no hover/cursor, so the game uses a tap-to-strike model.
  const isTouch = (): boolean => coarsePointer.matches || !finePointer.matches;

  let state: State = 'idle';
  let idleTimer = 0;
  let menuTimer = 0;
  let eatTimer = 0;

  // Live game objects (null when idle).
  let root: HTMLElement | null = null;
  let bug: HTMLElement | null = null;
  let menu: HTMLElement | null = null;
  let catcher: HTMLElement | null = null;
  let weaponCursor: HTMLElement | null = null;

  let bugCenter = { x: 0, y: 0 };
  let facing = 1; // 1 = facing right, -1 = facing left
  let stage = 0;
  let eatenCount = 0;
  let armed = false;
  let weapon: 'hammer' | 'spray' | null = null;
  let cursorOffset = { x: 8, y: 36 }; // pointer→sprite offset, set per weapon
  let lastPointer = { x: 0, y: 0 }; // last cursor position (for the spray aim loop)
  let aimRaf = 0; // rAF handle for the spray-aiming loop
  let knockRaf = 0; // rAF handle for the knockout ragdoll physics loop
  let sprayHold = 0; // setInterval handle while the spray trigger is held
  // Hammer hold-to-charge state.
  let charging = false;
  let chargeStart = 0;
  let hammerFacing = 1; // 1 = hammer faces right, -1 = faces left (toward the fly)
  let hammerAngle = -8; // resting tilt of the hammer head
  let hammerScale = 1;
  // Once exterminated with the insecticide, the fly never returns this session.
  let exterminated = false;

  injectStyles();

  // ── Eligibility ─────────────────────────────────────────────────────────
  function eligible(): boolean {
    // Runs on desktop AND touch (touch uses tap-to-strike). NOT gated on
    // reduced-motion: some phones report reduce=true unexpectedly and that was
    // silently hiding the game. Only gate on visibility + a sane min width.
    return document.visibilityState === 'visible' && window.innerWidth >= 360;
  }

  // ── Idle scheduling ───────────────────────────────────────────────────────
  function scheduleIdle(): void {
    if (exterminated) return; // exterminated for good — never schedule again
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(tryStart, IDLE_MS);
  }

  function onActivity(): void {
    // Only the idle countdown reacts to activity; an in-progress game ignores it
    // (the player is meant to interact). Escape is the kill switch.
    if (state === 'idle') scheduleIdle();
  }

  function tryStart(): void {
    if (state !== 'idle') return;
    if (!eligible()) {
      scheduleIdle();
      return;
    }
    start();
  }

  // ── Start a round ─────────────────────────────────────────────────────────
  function start(): void {
    state = 'active';
    stage = 0;
    eatenCount = 0;
    armed = false;

    root = document.createElement('div');
    root.className = 'bh-root';
    root.setAttribute('aria-hidden', 'true');
    document.body.appendChild(root);

    harvestTargets(HARVEST_BATCH);

    // Build the bug: .bh-bug (flight translate) > .bh-bob (idle bob) > .bh-sprite (scale/flip)
    bug = document.createElement('div');
    bug.className = 'bh-bug';
    const bob = document.createElement('div');
    bob.className = 'bh-bob';
    // Dedicated wrapper for the bite squash, so it never fights the fatness
    // scale (.bh-sprite) or the idle bob (.bh-bob).
    const chompEl = document.createElement('div');
    chompEl.className = 'bh-chomp';
    const sprite = document.createElement('div');
    sprite.className = 'bh-sprite';
    sprite.innerHTML = bugSprite(0);
    chompEl.appendChild(sprite);
    bob.appendChild(chompEl);
    bug.appendChild(bob);
    root.appendChild(bug);

    // Tap/click the fly: unarmed → it darts away (skittish); armed → strike it.
    // On desktop+armed the catcher intercepts instead (bug pointer-events: none),
    // so this path only strikes on touch, where there is no catcher.
    bug.addEventListener('click', (e) => {
      e.stopPropagation();
      if (armed && weapon) strikeBug();
      else dodge();
    });

    // Fly in from a random side, a little below the top nav.
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -bugW() : window.innerWidth + bugW();
    const startY = 120 + Math.random() * (window.innerHeight * 0.4);
    placeBug(startX, startY, false);
    facing = fromLeft ? 1 : -1;
    applyTransform();

    // Kick off eating on the next tick (after the entrance glide is set up).
    eatTimer = window.setTimeout(nextBite, 120);
    menuTimer = window.setTimeout(showMenu, MENU_DELAY_MS);
  }

  // ── Bug positioning ─────────────────────────────────────────────────────
  function placeBug(x: number, y: number, animate: boolean): void {
    if (!bug) return;
    bug.style.transition = animate ? `transform ${FLIGHT_MS}ms cubic-bezier(.45,.05,.3,1)` : 'none';
    bugCenter = { x: x + bugW() / 2, y: y + bugH() / 2 };
    bug.dataset.x = String(x);
    bug.dataset.y = String(y);
    applyTransform();
  }

  function applyTransform(): void {
    if (!bug) return;
    const x = Number(bug.dataset.x ?? 0);
    const y = Number(bug.dataset.y ?? 0);
    bug.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${facing})`;
  }

  // Current sprite footprint in CSS px. The bug grows by gaining grid cells, not
  // by enlarging pixels — PX (per-pixel size) is constant across every stage.
  function bugW(): number {
    return bugCell(stage).w * PX;
  }
  function bugH(): number {
    return bugCell(stage).h * PX;
  }

  // ── Eating loop ─────────────────────────────────────────────────────────
  function nextBite(): void {
    if (state !== 'active' || !bug) return;

    let targets = liveChars();
    if (targets.length === 0) {
      // Refill from further down the page, then retry once.
      if (harvestTargets(HARVEST_BATCH) > 0) targets = liveChars();
    }
    if (targets.length === 0) {
      // Nothing left to eat — just hover and wait to be hammered.
      eatTimer = window.setTimeout(nextBite, 900);
      return;
    }

    // Fly to the nearest letter for a natural-looking hop. The bug faces the
    // letter and offsets back so its forward mouth lands on the glyph.
    const target = nearest(targets, bugCenter);
    const c = charCenter(target);
    facing = c.x >= bugCenter.x ? 1 : -1;
    placeBug(c.x - bugW() / 2 - facing * bugW() * 0.32, c.y - bugH() * 0.45, true);

    eatTimer = window.setTimeout(() => {
      if (state !== 'active') return;
      chomp();
      // Recompute: earlier bites reflow text, so the span may have shifted.
      const bite = charCenter(target);
      crumbs(bite.x, bite.y);
      eatChar(target);
      eatenCount += 1;
      maybeFatten();
      eatTimer = window.setTimeout(nextBite, EAT_PAUSE_MS);
    }, FLIGHT_MS);
  }

  function nearest(spans: HTMLElement[], from: { x: number; y: number }): HTMLElement {
    let best = spans[0]!;
    let bestD = Infinity;
    for (const span of spans) {
      const c = charCenter(span);
      const d = (c.x - from.x) ** 2 + (c.y - from.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = span;
      }
    }
    return best;
  }

  function maybeFatten(): void {
    const target = Math.min(MAX_STAGE, Math.floor(eatenCount / LETTERS_PER_STAGE));
    if (target === stage) return;
    const prevCenter = { ...bugCenter };
    stage = target;
    const spriteEl = bug?.querySelector<HTMLElement>('.bh-sprite');
    if (spriteEl) {
      // Regenerate the bug on a DENSER grid — it gains pixels, not pixel size.
      spriteEl.innerHTML = bugSprite(stage);
      // Keep the bug centered now that its footprint grew, then a quick swell pop.
      placeBug(prevCenter.x - bugW() / 2, prevCenter.y - bugH() / 2, false);
      bug?.querySelector<HTMLElement>('.bh-chomp')?.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.12, 1.12)', offset: 0.4 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 300, easing: 'cubic-bezier(.3,1.4,.5,1)' }
      );
    }
  }

  /** Startled dart to a new spot — triggered by clicking the unarmed fly. */
  function dodge(): void {
    if (state !== 'active' || armed || !bug) return;

    const curX = Number(bug.dataset.x ?? 0);
    const curY = Number(bug.dataset.y ?? 0);
    const maxX = window.innerWidth - bugW() - 60;
    const maxY = window.innerHeight * 0.6;

    // Pick a landing spot that is meaningfully far from the current one.
    let nx = curX;
    let ny = curY;
    for (let tries = 0; tries < 8; tries++) {
      nx = 60 + Math.random() * Math.max(1, maxX - 60);
      ny = 120 + Math.random() * Math.max(1, maxY - 120);
      if (Math.hypot(nx - curX, ny - curY) > 240) break;
    }

    facing = nx >= curX ? 1 : -1;
    placeBug(nx, ny, true);

    // A quick startled wobble.
    const chompEl = bug.querySelector<HTMLElement>('.bh-chomp');
    chompEl?.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(0.8, 1.2)', offset: 0.3 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 320, easing: 'ease-out' }
    );

    // Interrupt the current bite so it doesn't immediately fly back to a letter.
    window.clearTimeout(eatTimer);
    eatTimer = window.setTimeout(nextBite, FLIGHT_MS + 280);
  }

  /** Touch strike: tap the armed fly to hit it right where it sits. */
  function strikeBug(): void {
    const r = bug?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : bugCenter.x;
    const cy = r ? r.top + r.height / 2 : bugCenter.y;
    if (weapon === 'spray') {
      sprayJet(cx, cy + 44, cx, cy); // mist rising into the bug
      explode(true); // lethal
    } else {
      knockOut(cx, cy + 60); // hit from below → vomits and is launched up and away
    }
  }

  /** Squash-and-stretch bite: the bug lunges down, the mouth gapes open. */
  function chomp(): void {
    const el = bug?.querySelector<HTMLElement>('.bh-chomp');
    el?.animate(
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(7px) scale(1.18, 0.8)', offset: 0.35 }, // lunge + squash
        { transform: 'translateY(0) scale(0.95, 1.08)', offset: 0.7 }, // rebound
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 260, easing: 'ease-in-out' }
    );
    // The mouth chomps on its own (continuous CSS animation), Pac-Man style.
  }

  /** A few text-colored pixels falling away — the crumbs of an eaten letter. */
  function crumbs(x: number, y: number): void {
    if (!root) return;
    const colors = ['#F2F2EE', '#C9CBD0', '#93938B'];
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div');
      p.className = 'bh-particle';
      const size = 2 + Math.random() * 2.5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[i % colors.length]!;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      root.appendChild(p);

      const dx = (Math.random() - 0.5) * 26;
      const dy = 10 + Math.random() * 22; // crumbs fall
      const anim = p.animate(
        [
          { transform: 'translate(0,0)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
        ],
        { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)' }
      );
      anim.onfinish = () => p.remove();
    }
  }

  /** Spit the swallowed glyphs out of the bug in a burst that scatters and falls. */
  function spitLetters(x: number, y: number, glyphs: string[]): void {
    if (!root || glyphs.length === 0) return;
    const sample = glyphs.slice(-24); // cap so a long round doesn't flood the screen
    sample.forEach((ch, i) => {
      const el = document.createElement('span');
      el.className = 'bh-flyletter';
      el.textContent = ch;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.fontSize = `${15 + Math.random() * 13}px`;
      if (i % 3 === 0) el.style.color = '#C6F24E'; // a few lime accents
      root.appendChild(el);

      const angle = (Math.PI * 2 * i) / sample.length + Math.random() * 0.7;
      const dist = 70 + Math.random() * 130;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 60; // bias downward — they fall back to the page
      const rot = (Math.random() - 0.5) * 560;

      const anim = el.animate(
        [
          { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        { duration: 720 + Math.random() * 320, easing: 'cubic-bezier(.15,.55,.3,1)' }
      );
      anim.onfinish = () => el.remove();
    });
  }

  // ── Weapons menu ──────────────────────────────────────────────────────────
  function showMenu(): void {
    if (state !== 'active' || !root || menu) return;

    menu = document.createElement('div');
    menu.className = 'bh-menu';
    const dismissHint = isTouch() ? 'Tap ✕ to dismiss' : 'Esc to dismiss';
    menu.innerHTML = `
      <button class="bh-menu-close" type="button" aria-label="Dismiss the game">✕</button>
      <div class="bh-menu-title">PEST CONTROL</div>
      <button class="bh-weapon" data-weapon="hammer" type="button" aria-label="Swat the bug with a hammer">
        <span class="bh-weapon-icon">${hammerSprite()}</span>
        <span class="bh-weapon-label">Hammer</span>
      </button>
      <button class="bh-weapon bh-weapon--lethal" data-weapon="spray" type="button" aria-label="Exterminate the bug with insecticide — it won't come back">
        <span class="bh-weapon-icon">${spraySprite()}</span>
        <span class="bh-weapon-label">Insecticide<small>lethal</small></span>
      </button>
      <div class="bh-menu-hint">${dismissHint}</div>
    `;
    root.appendChild(menu);

    menu.querySelector<HTMLButtonElement>('.bh-menu-close')?.addEventListener('click', kill);
    menu.querySelectorAll<HTMLButtonElement>('.bh-weapon').forEach((btn) =>
      btn.addEventListener('click', () => {
        const kind = btn.dataset.weapon === 'spray' ? 'spray' : 'hammer';
        arm(kind);
      })
    );

    // Slide in on the next frame.
    requestAnimationFrame(() => menu?.classList.add('bh-menu--open'));
  }

  // ── Armed mode (the chosen weapon follows the cursor, click to strike) ─────
  function arm(kind: 'hammer' | 'spray'): void {
    if (armed || !root) return;
    armed = true;
    weapon = kind;

    menu?.classList.add('bh-menu--armed');
    menu?.querySelectorAll<HTMLElement>('.bh-weapon').forEach((b) =>
      b.classList.toggle('bh-weapon--active', b.dataset.weapon === kind)
    );

    // Touch: no cursor or full-screen catcher (that would block page scrolling).
    // The fly stays tappable and its click handler routes to strikeBug().
    if (isTouch()) return;

    // Desktop: hand click control to the catcher; the fly stops dodging clicks.
    if (bug) bug.style.pointerEvents = 'none';

    catcher = document.createElement('div');
    catcher.className = 'bh-catcher';
    root.appendChild(catcher);

    weaponCursor = document.createElement('div');
    weaponCursor.className = 'bh-weapon-cursor';
    if (kind === 'spray') {
      weaponCursor.innerHTML = spraySprite();
      weaponCursor.style.width = '38px';
      weaponCursor.style.height = '46px';
      weaponCursor.style.transformOrigin = 'center'; // pivot in place to aim
      cursorOffset = { x: 19, y: 23 }; // centered on the pointer
    } else {
      weaponCursor.innerHTML = hammerSprite();
      weaponCursor.style.width = '44px';
      weaponCursor.style.height = '44px';
      cursorOffset = { x: 8, y: 36 }; // head near the pointer
    }
    root.appendChild(weaponCursor);

    catcher.addEventListener('mousemove', onAim);
    if (kind === 'spray') {
      // Hold to keep spraying; the hammer is a single swing.
      catcher.addEventListener('mousedown', onSprayStart);
      window.addEventListener('mouseup', onSprayStop);
      // The can continuously rotates to point at the fly — even when the cursor
      // is still and the fly is flying around.
      lastPointer = { x: bugCenter.x, y: bugCenter.y + 90 };
      aimRaf = requestAnimationFrame(aimSpray);
    } else {
      // Hold to charge, release to swing. mouseup on window so a release that
      // drifts off the catcher still fires the strike. The aim loop keeps the
      // hammer flipped toward the fly even when the cursor is still.
      lastPointer = { x: bugCenter.x, y: bugCenter.y };
      placeHammer();
      catcher.addEventListener('mousedown', onHammerDown);
      window.addEventListener('mouseup', onHammerUp);
      aimRaf = requestAnimationFrame(aimHammer);
    }
  }

  function onAim(e: MouseEvent): void {
    lastPointer = { x: e.clientX, y: e.clientY };
    if (weapon === 'spray') return; // aimSpray() owns the spray transform
    placeHammer();
  }

  /** Paint the hammer at the pointer, flipped toward the fly, with charge pose. */
  function placeHammer(): void {
    if (!weaponCursor || weapon !== 'hammer') return;
    weaponCursor.style.transform =
      `translate3d(${lastPointer.x - cursorOffset.x}px, ${lastPointer.y - cursorOffset.y}px, 0) ` +
      `scaleX(${hammerFacing}) rotate(${hammerAngle}deg) scale(${hammerScale})`;
  }

  /** rAF loop: keep the aerosol can pointing its nozzle at the fly. */
  function aimSpray(): void {
    if (weapon !== 'spray' || !weaponCursor) {
      aimRaf = 0;
      return;
    }
    let angle = 0;
    if (bug) {
      const r = bug.getBoundingClientRect();
      const dx = r.left + r.width / 2 - lastPointer.x;
      const dy = r.top + r.height / 2 - lastPointer.y;
      angle = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0° = nozzle pointing up
    }
    weaponCursor.style.transform =
      `translate3d(${lastPointer.x - cursorOffset.x}px, ${lastPointer.y - cursorOffset.y}px, 0) rotate(${angle}deg)`;
    aimRaf = requestAnimationFrame(aimSpray);
  }

  // ── Hammer: face the fly (horizontal flip) + hold to charge, release to swing ─
  /** rAF loop while the hammer is armed: flip toward the fly, build charge if held. */
  function aimHammer(): void {
    if (weapon !== 'hammer' || !weaponCursor) {
      aimRaf = 0;
      return;
    }
    // Point at the fly — HORIZONTALLY ONLY (a flip), never a full aim rotation.
    const r = bug?.getBoundingClientRect();
    const bx = r ? r.left + r.width / 2 : bugCenter.x;
    hammerFacing = bx >= lastPointer.x ? 1 : -1;

    if (charging) {
      const t = Math.min(1, (performance.now() - chargeStart) / HAMMER_CHARGE_MS);
      const tremble = t * (Math.random() - 0.5) * 6; // jitter grows with power
      hammerAngle = -8 - t * 52 + tremble; // wind up backwards
      hammerScale = 1 + t * 0.3; // swell
      // Lime charge glow that intensifies toward full power.
      weaponCursor.style.filter =
        `drop-shadow(0 2px 2px rgba(0,0,0,0.4)) ` +
        `drop-shadow(0 0 ${4 + t * 14}px rgba(198,242,78,${0.3 + t * 0.55}))`;
    }
    placeHammer();
    aimRaf = requestAnimationFrame(aimHammer);
  }

  /** Press and hold: begin charging — aimHammer() renders the wind-up. */
  function onHammerDown(e: MouseEvent): void {
    if (weapon !== 'hammer' || charging) return;
    charging = true;
    chargeStart = performance.now();
    lastPointer = { x: e.clientX, y: e.clientY };
  }

  /** Release: slam the hammer down with power proportional to the charge. */
  function onHammerUp(e: MouseEvent): void {
    if (!charging) return;
    charging = false;
    const charge = Math.min(1, (performance.now() - chargeStart) / HAMMER_CHARGE_MS);
    const startAngle = hammerAngle;
    const startScale = hammerScale;

    // Reset the resting visual state.
    lastPointer = { x: e.clientX, y: e.clientY };
    hammerAngle = -8;
    hammerScale = 1;
    if (weaponCursor) weaponCursor.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))';

    // Swing down from the wound-up angle, then settle back to rest — keeping the
    // horizontal flip so the swing reads as aimed at the fly's side.
    const base = `translate3d(${e.clientX - cursorOffset.x}px, ${e.clientY - cursorOffset.y}px, 0)`;
    const flip = `scaleX(${hammerFacing})`;
    const swingFwd = 46 + charge * 34; // harder charge → deeper slam
    weaponCursor?.animate(
      [
        { transform: `${base} ${flip} rotate(${startAngle}deg) scale(${startScale})` },
        { transform: `${base} ${flip} rotate(${swingFwd}deg) scale(1)`, offset: 0.32 },
        { transform: `${base} ${flip} rotate(-8deg) scale(1)` },
      ],
      { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1)' }
    );

    // Hit check: charge widens the strike radius and the knockback force.
    const r = bug?.getBoundingClientRect();
    const bcx = r ? r.left + r.width / 2 : bugCenter.x;
    const bcy = r ? r.top + r.height / 2 : bugCenter.y;
    const dist = Math.hypot(e.clientX - bcx, e.clientY - bcy);
    // Radius tracks the bug's actual on-screen size so hitting the visible body
    // always counts; charge widens it a bit more.
    const radius = Math.max(BASE_HIT_RADIUS, bugW() * 0.45) * (1 + charge * 0.5);
    if (dist <= radius) {
      knockOut(e.clientX, e.clientY, 1 + charge); // harder charge → flies farther
    } else {
      puff(e.clientX, e.clientY, false);
    }
  }

  // ── Held aerosol (insecticide): keep spraying while the trigger is down ────
  function onSprayStart(e: MouseEvent): void {
    if (weapon !== 'spray' || sprayHold) return;
    lastPointer = { x: e.clientX, y: e.clientY };
    sprayStep(); // first puff immediately, even on a quick click
    sprayHold = window.setInterval(sprayStep, SPRAY_INTERVAL_MS);
  }

  function onSprayStop(): void {
    if (sprayHold) {
      window.clearInterval(sprayHold);
      sprayHold = 0;
    }
  }

  /** One puff of aerosol toward the fly + a hit check, fired on the hold cadence. */
  function sprayStep(): void {
    if (weapon !== 'spray' || !weaponCursor || state !== 'active') {
      onSprayStop();
      return;
    }
    const r = bug?.getBoundingClientRect();
    const bcx = r ? r.left + r.width / 2 : bugCenter.x;
    const bcy = r ? r.top + r.height / 2 : bugCenter.y;

    sprayJet(lastPointer.x, lastPointer.y, bcx, bcy, 8);

    const dist = Math.hypot(lastPointer.x - bcx, lastPointer.y - bcy);
    if (dist <= SPRAY_RANGE * (1 + stage * 0.12)) {
      onSprayStop();
      explode(true); // lethal — the fly won't come back
    }
  }

  // ── Hammer knockout (non-lethal) ──────────────────────────────────────────
  /**
   * Whacked with the hammer: the bug VOMITS every letter it swallowed and is
   * launched off-screen along the swing direction, tumbling as it goes. The
   * eaten text snaps back; the fly respawns after the cooldown.
   */
  function knockOut(fromX: number, fromY: number, force = 1): void {
    if (state !== 'active' || !bug) return;
    state = 'cooldown';
    window.clearTimeout(eatTimer);
    window.clearTimeout(menuTimer);

    puff(bugCenter.x, bugCenter.y, false); // impact spark
    spitLetters(bugCenter.x, bugCenter.y, eatenGlyphs()); // vomit the swallowed glyphs

    // Drop the armed UI immediately so only the ragdoll is left on screen.
    menu?.classList.remove('bh-menu--open');
    catcher?.remove();
    weaponCursor?.remove();
    catcher = null;
    weaponCursor = null;
    weapon = null;
    armed = false;

    // Restore the eaten text on the NEXT frame: doing the (reflow-heavy) restore
    // on the same frame as the hit is what caused the little freeze.
    requestAnimationFrame(() => restoreAll());

    // ── Ragdoll physics: knocked flying, bounces off edges + buttons, then
    //    falls out the BOTTOM of the screen (no floor collision down there). ──
    const dirX = bugCenter.x - fromX;
    const dirY = bugCenter.y - fromY;
    const dlen = Math.hypot(dirX, dirY) || 1;
    const speed = 7 + force * 5; // px/frame — lively but watchable, not a teleport
    let vx = (dirX / dlen) * speed;
    let vy = (dirY / dlen) * speed - 7; // upward pop before gravity takes over
    let px = Number(bug.dataset.x ?? 0);
    let py = Number(bug.dataset.y ?? 0);
    let rot = 0;
    const spin = (vx >= 0 ? 1 : -1) * (7 + force * 5); // deg/frame tumble
    const GRAVITY = 0.6;
    const BOUNCE = 0.62; // energy kept per bounce
    const obstacles = collectObstacles();

    bug.style.pointerEvents = 'none';
    bug.style.transition = 'none';

    const w = bugW();
    const h = bugH();
    let frames = 0;

    const finish = (): void => {
      if (knockRaf) {
        cancelAnimationFrame(knockRaf);
        knockRaf = 0;
      }
      teardown();
      state = 'idle';
      scheduleIdle();
    };

    const step = (): void => {
      if (state !== 'cooldown' || !bug) return; // killed mid-flight
      frames += 1;
      vy += GRAVITY;
      px += vx;
      py += vy;
      rot += spin;

      // Screen walls: bounce off left / right / top. The bottom is OPEN — that
      // is the only way out, so the bug always eventually falls through it.
      if (px < 0) {
        px = 0;
        vx = Math.abs(vx) * BOUNCE;
      } else if (px + w > window.innerWidth) {
        px = window.innerWidth - w;
        vx = -Math.abs(vx) * BOUNCE;
      }
      if (py < 0) {
        py = 0;
        vy = Math.abs(vy) * BOUNCE;
      }

      // Buttons / links: solid obstacles — bounce off the nearest face.
      for (const o of obstacles) {
        if (px < o.x + o.w && px + w > o.x && py < o.y + o.h && py + h > o.y) {
          const penL = o.x - (px + w); // <= 0
          const penR = o.x + o.w - px; // >= 0
          const penT = o.y - (py + h);
          const penB = o.y + o.h - py;
          const mx = Math.abs(penL) < Math.abs(penR) ? penL : penR;
          const my = Math.abs(penT) < Math.abs(penB) ? penT : penB;
          if (Math.abs(mx) < Math.abs(my)) {
            px += mx;
            vx = -vx * BOUNCE;
          } else {
            py += my;
            vy = -vy * BOUNCE;
          }
        }
      }

      bug.dataset.x = String(px);
      bug.dataset.y = String(py);
      bug.style.transform = `translate3d(${px}px, ${py}px, 0) scaleX(${facing}) rotate(${rot}deg)`;

      // Gone out the bottom (or a safety cap so it can never get stuck).
      if (py > window.innerHeight + 20 || frames > 300) {
        finish();
        return;
      }
      knockRaf = requestAnimationFrame(step);
    };

    knockRaf = requestAnimationFrame(step);
  }

  /** Snapshot of on-screen buttons/links the ragdoll can bounce off. */
  function collectObstacles(): { x: number; y: number; w: number; h: number }[] {
    const els = document.querySelectorAll<HTMLElement>('button, a, [role="button"]');
    const out: { x: number; y: number; w: number; h: number }[] = [];
    els.forEach((el) => {
      if (el.closest('.bh-root')) return; // ignore the game's own UI
      const r = el.getBoundingClientRect();
      if (r.width < 12 || r.height < 12) return;
      if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
        return; // off-screen
      }
      out.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    });
    return out.slice(0, 40);
  }

  // ── Explosion + restore ───────────────────────────────────────────────────
  function explode(lethal = false): void {
    if (state !== 'active') return;
    state = 'cooldown';
    if (lethal) exterminated = true; // insecticide: gone for the rest of the session
    window.clearTimeout(eatTimer);
    window.clearTimeout(menuTimer);

    puff(bugCenter.x, bugCenter.y, true);
    // Spit the swallowed glyphs out of the bug's belly before it vanishes.
    spitLetters(bugCenter.x, bugCenter.y, eatenGlyphs());
    bug?.remove();
    bug = null;

    // Snap eaten letters back into place.
    restoreAll();
    if (lethal) showToast('EXTERMINATED');

    // Slide the menu away and drop the armed UI.
    menu?.classList.remove('bh-menu--open');
    catcher?.remove();
    weaponCursor?.remove();
    catcher = null;
    weaponCursor = null;
    weapon = null;
    armed = false;

    window.setTimeout(() => {
      teardown();
      state = 'idle';
      scheduleIdle(); // no-op once exterminated
    }, lethal ? 1200 : 700);
  }

  /** A brief centered toast — used to confirm a lethal extermination. */
  function showToast(text: string): void {
    if (!root) return;
    const t = document.createElement('div');
    t.className = 'bh-toast';
    t.textContent = text;
    root.appendChild(t);
    t.animate(
      [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(0.8)' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.2 },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.75 },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(1.06)' },
      ],
      { duration: 1150, easing: 'ease-out' }
    );
  }

  /** Directed aerosol jet: a cone of mist fired from the nozzle toward the fly. */
  function sprayJet(
    originX: number,
    originY: number,
    targetX: number,
    targetY: number,
    count = 22
  ): void {
    if (!root) return;
    const colors = ['#C6F24E', '#9FE0C0', '#E8FBD0'];
    const baseAngle = Math.atan2(targetY - originY, targetX - originX);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'bh-particle';
      const size = 3 + Math.random() * 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = '50%';
      p.style.background = colors[i % colors.length]!;
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      root.appendChild(p);

      // Narrow cone around the aim direction; mist travels outward and fades.
      const spread = (Math.random() - 0.5) * 0.5; // ≈ ±14°
      const a = baseAngle + spread;
      const reach = 26 + Math.random() * 80;
      const dx = Math.cos(a) * reach;
      const dy = Math.sin(a) * reach;
      const anim = p.animate(
        [
          { transform: 'translate(0,0) scale(0.5)', opacity: 0.95 },
          { transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0 },
        ],
        { duration: 460 + Math.random() * 220, easing: 'cubic-bezier(.15,.6,.3,1)' }
      );
      anim.onfinish = () => p.remove();
    }
  }

  /** Burst of pixel particles. `big` = the bug exploding; small = a missed swing. */
  function puff(x: number, y: number, big: boolean): void {
    if (!root) return;
    const colors = ['#C6F24E', '#3D5BFF', '#F4F4F0'];
    const count = big ? 22 : 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'bh-particle';
      const size = big ? 5 + Math.random() * 5 : 3 + Math.random() * 2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[i % colors.length]!;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      root.appendChild(p);

      const angle = (Math.PI * 2 * i) / count + Math.random();
      const reach = big ? 50 + Math.random() * 70 : 18 + Math.random() * 18;
      const dx = Math.cos(angle) * reach;
      const dy = Math.sin(angle) * reach - (big ? 10 : 4);

      const anim = p.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 },
        ],
        { duration: big ? 620 : 360, easing: 'cubic-bezier(.2,.7,.3,1)' }
      );
      anim.onfinish = () => p.remove();
    }
  }

  // ── Teardown ────────────────────────────────────────────────────────────
  function teardown(): void {
    window.clearTimeout(eatTimer);
    window.clearTimeout(menuTimer);
    onSprayStop();
    window.removeEventListener('mouseup', onSprayStop);
    window.removeEventListener('mouseup', onHammerUp);
    charging = false;
    if (aimRaf) {
      cancelAnimationFrame(aimRaf);
      aimRaf = 0;
    }
    if (knockRaf) {
      cancelAnimationFrame(knockRaf);
      knockRaf = 0;
    }
    if (state === 'active' || state === 'cooldown') {
      // Make sure no letters are left half-eaten if we bailed mid-round.
      restoreAll();
    }
    root?.remove();
    root = null;
    bug = null;
    menu = null;
    catcher = null;
    weaponCursor = null;
  }

  /** Hard kill (Esc, tab hidden, language change): restore and reset to idle. */
  function kill(): void {
    if (state === 'idle') return;
    teardown();
    state = 'cooldown';
    window.setTimeout(() => {
      state = 'idle';
      scheduleIdle();
    }, COOLDOWN_MS);
  }

  // ── Global listeners ──────────────────────────────────────────────────────
  const activityEvents = ['mousemove', 'keydown', 'scroll', 'pointerdown', 'wheel'] as const;
  activityEvents.forEach((ev) =>
    window.addEventListener(ev, onActivity, { passive: true })
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') kill();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') kill();
  });

  // A language switch flips html[lang]; our text snapshots would be stale, so bail.
  const langObserver = new MutationObserver(() => kill());
  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });

  // Begin the idle countdown.
  scheduleIdle();

  // Dev-only manual trigger (stripped from production builds). Lets us start a
  // round on demand without waiting for inactivity or a fine pointer.
  if (import.meta.env.DEV) {
    (window as Window & { __bugHunt?: () => void }).__bugHunt = () => {
      exterminated = false; // dev: allow re-triggering even after a lethal kill
      if (state === 'idle') start();
    };
    // dev: render any fatness stage to eyeball the sprite without eating 30 letters
    (window as unknown as { __bugSprite?: (s: number) => string }).__bugSprite = (s) =>
      bugSprite(s);
  }
}

// ── One-time stylesheet injection ─────────────────────────────────────────
function injectStyles(): void {
  if (document.getElementById('bh-styles')) return;
  const style = document.createElement('style');
  style.id = 'bh-styles';
  style.textContent = `
    /* High z-index on the ROOT itself: position:fixed makes .bh-root its own
       stacking context, so without this it sits at level auto(0) and any page
       element with z-index >= 1 (e.g. the hero content at z-index 3) paints
       over the whole game. Lift the root above everything. */
    .bh-root { position: fixed; inset: 0; pointer-events: none; z-index: 2147483000; }

    .bh-char { will-change: transform, opacity; }

    .bh-bug {
      position: fixed; left: 0; top: 0;
      z-index: 9996; will-change: transform; pointer-events: auto; cursor: pointer;
    }
    .bh-bob { animation: bh-bob 0.42s ease-in-out infinite; }
    .bh-chomp { transform-origin: center bottom; }
    .bh-sprite {
      display: inline-block; line-height: 0;
      transform-origin: center bottom;
      filter: drop-shadow(0 3px 2px rgba(0,0,0,0.35));
    }
    @keyframes bh-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

    /* Three body segments throbbing out of phase → the bug reads as having WEIGHT.
       The abdomen (most mass) swings slowest and widest; the head barely moves.
       transform-box:fill-box pins each segment's pivot to its own bounding box. */
    .bh-seg { transform-box: fill-box; }
    .bh-abdomen { transform-origin: 68% 50%; animation: bh-throb-heavy 0.62s ease-in-out infinite; }
    .bh-thorax  { transform-origin: center;  animation: bh-throb-mid 0.46s ease-in-out infinite; animation-delay: -0.09s; }
    .bh-head    { transform-origin: 38% 55%; animation: bh-throb-light 0.42s ease-in-out infinite; animation-delay: -0.05s; }
    @keyframes bh-throb-heavy { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.07, 0.9); } }
    @keyframes bh-throb-mid   { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.04, 0.95); } }
    @keyframes bh-throb-light { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.025, 0.975); } }

    /* Thin translucent wing, flapping fast and hinged at the thorax. */
    .bh-wing { opacity: 0.32; transform-box: fill-box; transform-origin: right bottom; animation: bh-flutter 0.1s ease-in-out infinite; }
    @keyframes bh-flutter { 0%,100% { transform: rotate(3deg) scaleY(1); } 50% { transform: rotate(-24deg) scaleY(0.72); } }

    /* Pac-Man jaws: two real jaws rotating apart on a shared hinge, baring the
       dark mouth line behind them. transform-box:view-box + the per-stage hinge
       origin are set inline on each group (the grid grows as the bug fattens). */
    .bh-jaw-top { animation: bh-chew-top 0.26s ease-in-out infinite; }
    .bh-jaw-bot { animation: bh-chew-bot 0.26s ease-in-out infinite; }
    @keyframes bh-chew-top { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-32deg); } }
    @keyframes bh-chew-bot { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(32deg); } }

    /* Glyphs the bug spits out when it explodes. */
    .bh-flyletter {
      position: fixed; z-index: 9994; pointer-events: none;
      font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700;
      color: #F2F2EE; will-change: transform, opacity;
      text-shadow: 0 1px 2px rgba(0,0,0,0.45);
    }

    .bh-menu {
      position: fixed; right: 0; top: 50%; transform: translate(110%, -50%);
      z-index: 9995; pointer-events: auto;
      display: flex; flex-direction: column; gap: 10px; align-items: stretch;
      padding: 16px 16px 14px; min-width: 168px;
      background: rgba(12,13,16,0.94); border: 1px solid #34373F; border-right: none;
      box-shadow: -6px 0 24px rgba(0,0,0,0.4);
      transition: transform 0.45s cubic-bezier(.2,.8,.2,1);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .bh-menu--open { transform: translate(0, -50%); }
    .bh-menu-close {
      position: absolute; top: 6px; right: 8px;
      background: transparent; border: none; color: #93938B; cursor: pointer;
      font-size: 14px; line-height: 1; padding: 4px; font-family: inherit;
    }
    .bh-menu-close:hover { color: #FF5C5C; }
    .bh-menu-title {
      color: #C6F24E; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      border-bottom: 1px solid #23252D; padding-bottom: 8px; margin-bottom: 2px;
    }
    .bh-weapon {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      background: #14151A; border: 1px solid #34373F; color: #F2F2EE;
      padding: 10px 12px; transition: border-color .18s ease, background .18s ease;
      font-family: inherit;
    }
    .bh-weapon:hover { border-color: #C6F24E; background: #1A1C22; }
    .bh-weapon-icon { display: block; width: 26px; height: 28px; flex: none; }
    .bh-weapon-label { display: flex; flex-direction: column; font-size: 13px; letter-spacing: 0.5px; line-height: 1.3; }
    .bh-weapon-label small { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #7A4242; }
    .bh-weapon--lethal:hover { border-color: #FF5C5C; background: #1C1416; }
    .bh-weapon--lethal:hover .bh-weapon-label small { color: #FF7A7A; }
    .bh-weapon--active { border-color: #C6F24E; box-shadow: 0 0 0 2px rgba(198,242,78,0.3); }
    .bh-weapon--lethal.bh-weapon--active { border-color: #FF5C5C; box-shadow: 0 0 0 2px rgba(255,92,92,0.3); }
    .bh-menu-hint { color: #5F6068; font-size: 10px; letter-spacing: 0.5px; text-align: center; }

    .bh-catcher { position: fixed; inset: 0; z-index: 9990; pointer-events: auto; cursor: none; }
    .bh-weapon-cursor {
      position: fixed; left: 0; top: 0;
      z-index: 9999; pointer-events: none; transform-origin: 60% 85%;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));
    }
    .bh-particle { position: fixed; z-index: 9997; pointer-events: none; border-radius: 1px; }
    .bh-toast {
      position: fixed; left: 50%; top: 42%; z-index: 9998; pointer-events: none;
      transform: translate(-50%, -50%); white-space: nowrap;
      font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700;
      font-size: 24px; letter-spacing: 3px; color: #FF5C5C;
      text-shadow: 0 2px 10px rgba(0,0,0,0.7);
    }
  `;
  document.head.appendChild(style);
}
