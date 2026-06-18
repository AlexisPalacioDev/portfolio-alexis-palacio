/**
 * sprites.ts — pixel-art SVG sprites for the "bug hunt" easter-egg game.
 *
 * Pure functions: given parameters, return an SVG markup string. No DOM access
 * and no side effects, so the visuals are trivial to tweak and unit-test in
 * isolation. The controller (bugHunt.ts) is the only thing that touches the DOM.
 *
 * ── The bug ────────────────────────────────────────────────────────────────
 * The fly is drawn in SIDE PROFILE, facing right (the controller flips it with
 * scaleX(-1)), and is built PROCEDURALLY from three body segments so the
 * stylesheet can animate each independently — they throb out of phase, which is
 * what gives the bug its sense of WEIGHT:
 *   - `.bh-abdomen` — the heavy rear blob (swells the most as the bug fattens)
 *   - `.bh-thorax`  — the middle (carries the wing + legs)
 *   - `.bh-head`    — the front (eye + antennae; barely grows)
 *   - `.bh-jaw-top` / `.bh-jaw-bot` — two jaws rotating apart on a shared hinge,
 *     a proper Pac-Man chomp, baring the dark mouth line behind them.
 *
 * ── Constant-pixel growth (the important bit) ────────────────────────────────
 * Fattening does NOT scale the sprite up — that would just enlarge each pixel
 * and look crunchy. Instead every stage REGENERATES the bug on a DENSER grid
 * while each on-screen pixel stays exactly `PX` CSS px. So a fat bug is a
 * higher-resolution drawing, not a zoom of the small one: it gains pixels, not
 * pixel size. `bugSprite(stage)` bakes `width/height` in CSS px (gridW*PX) and a
 * `viewBox` in grid units, so 1 grid cell always renders as `PX` px.
 *
 * Rendering uses `shape-rendering="crispEdges"` so each 1×1 rect stays a hard
 * pixel — that is what gives the sprites their pixel-art look.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
// Keyed by single-char codes used in the pixel grids below. Any char not in the
// map (space / '.') is transparent.
const PALETTE: Record<string, string> = {
  // body
  W: '#F4F4F0', // body (white)
  w: '#C9CBD0', // body shading / bottom edge
  d: '#A9ABB2', // deeper shade / abdomen segmentation ribs
  R: '#9B2D2D', // eye (fly red)
  g: '#FFFFFF', // eye glint / top highlight
  L: '#2A2C33', // legs + antennae
  // wing (kept very translucent by .bh-wing in the stylesheet)
  A: '#DCEAFF',
  // mouth
  M: '#14151A', // jaw edge / mouth line (dark)
  // hammer
  H: '#C8CBD2', // hammer head (light)
  h: '#8A8E99', // hammer head (dark)
  S: '#8A5A2B', // handle (light)
  s: '#5E3717', // handle (dark)
  // insecticide can (lethal weapon)
  C: '#46A6A0', // can body (teal)
  c: '#2F6F6B', // can shadow
  N: '#2A2C33', // nozzle / cap
  l: '#EDEDE7', // label band
  // grabbing hand
  K: '#E8B98C', // skin
  k: '#CE9A6E', // skin shadow
  n: '#9C6B42', // knuckle crease
};

// ── Constant on-screen pixel size ────────────────────────────────────────────
// Every grid cell renders as exactly this many CSS px, at every stage. The bug
// grows by adding cells, never by enlarging this value.
export const PX = 3;

// ── Procedural pixel grid ─────────────────────────────────────────────────────
type Grid = (string | null)[][]; // grid[y][x] = palette code | null (transparent)

function makeGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array<string | null>(w).fill(null));
}

function inBounds(grid: Grid, x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0]!.length;
}

function plot(grid: Grid, x: number, y: number, code: string): void {
  if (inBounds(grid, x, y)) grid[y]![x] = code;
}

/** Fill a pixel-art ellipse centered at (cx,cy) with radii (rx,ry). */
function fillEllipse(grid: Grid, cx: number, cy: number, rx: number, ry: number, code: string): void {
  const h = grid.length;
  for (let y = 0; y < h; y++) {
    const ny = (y + 0.5 - cy) / ry; // +0.5 → sample cell center
    if (Math.abs(ny) > 1) continue;
    const half = rx * Math.sqrt(1 - ny * ny);
    const x0 = Math.round(cx - half);
    const x1 = Math.round(cx + half);
    for (let x = x0; x <= x1; x++) plot(grid, x, y, code);
  }
}

/**
 * Volume shading for a filled body blob: bottom edge → `w`, the lowest interior
 * row → `d` (a grounded shadow that reads as mass), and a 1px top highlight on
 * the upper-left → `g`. Mutates the grid in place. Only repaints `W` cells.
 */
function shadeBlob(grid: Grid, opts: { highlight?: boolean } = {}): void {
  const h = grid.length;
  const w = grid[0]!.length;
  const snapshot = grid.map((row) => row.slice());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (snapshot[y]![x] !== 'W') continue;
      const below = inBounds(grid, x, y + 1) ? snapshot[y + 1]![x] : null;
      const above = inBounds(grid, x, y - 1) ? snapshot[y - 1]![x] : null;
      if (below === null) {
        grid[y]![x] = 'w'; // bottom contour
      } else if (snapshot[y + 2]?.[x] == null) {
        grid[y]![x] = 'd'; // grounded shadow just above the bottom edge
      } else if (above === null && opts.highlight) {
        grid[y]![x] = 'g'; // crisp top highlight
      }
    }
  }
}

/** Convert a grid to 1×1 SVG rects (1.02 closes hairline seams when scaled). */
function gridToRects(grid: Grid): string {
  let out = '';
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]!;
    for (let x = 0; x < row.length; x++) {
      const code = row[x];
      if (!code) continue;
      const fill = PALETTE[code];
      if (!fill) continue;
      out += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
    }
  }
  return out;
}

// ── Bug geometry ──────────────────────────────────────────────────────────────
// Per-stage segment radii (grid cells). The abdomen swells hard; the thorax a
// little; the head essentially holds its size (a fly's head doesn't bloat).
function segments(stage: number): {
  ab: { rx: number; ry: number };
  th: { rx: number; ry: number };
  hd: { rx: number; ry: number };
} {
  return {
    ab: { rx: 5 + stage * 1.7, ry: 3.6 + stage * 1.15 },
    th: { rx: 3.2 + stage * 0.45, ry: 3.2 + stage * 0.5 },
    hd: { rx: 2.6 + stage * 0.12, ry: 2.6 + stage * 0.12 },
  };
}

/** Draw a thin insect leg: straight down from the body, then a knee bend out. */
function drawLeg(grid: Grid, x: number, topY: number, dir: number, len: number): void {
  let cx = x;
  let cy = topY;
  const knee = Math.floor(len / 2);
  for (let i = 0; i < len; i++) {
    plot(grid, cx, cy, 'L');
    cy += 1;
    if (i >= knee) cx += dir; // splay outward below the knee
  }
}

// Layout margins (grid cells) around the body.
const LEFT = 1;
const JAW = 4; // mouth room ahead of the head
const RIGHT = 1;
const PAD = 1; // breathing room at the top/bottom edges

interface Seg {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}
interface BugLayout {
  w: number;
  h: number;
  ab: Seg;
  th: Seg;
  hd: Seg;
  hinge: { x: number; y: number };
}

function layout(stage: number): BugLayout {
  const { ab, th, hd } = segments(stage);

  // Horizontal chain (left→right): abdomen, thorax, head, with a generous
  // overlap so the segments read as one body while they throb independently.
  const abCx = LEFT + ab.rx;
  const thCx = abCx + ab.rx + th.rx - Math.min(ab.rx, th.rx) * 0.65;
  const hdCx = thCx + th.rx + hd.rx - Math.min(th.rx, hd.rx) * 0.5;

  // Vertical DROOP: the heavy rear SAGS below the head — more when fatter — so
  // the tail visibly hangs with weight. Head highest, abdomen lowest.
  const droop = 1 + stage * 0.95;
  let hdCy = 0;
  let thCy = droop * 0.4;
  let abCy = droop;

  // Account for everything that pokes out of the blobs when sizing the grid.
  const legAb = 4 + Math.round(ab.ry * 0.4);
  const legTh = 4 + Math.round(th.ry * 0.4);
  const top = Math.min(
    thCy - th.ry - 2 - th.ry * 0.7, // long wing crest above the thorax (with slack)
    hdCy - hd.ry - 3, // antennae above the head
    abCy - ab.ry,
    thCy - th.ry
  );
  const bottom = Math.max(
    abCy + ab.ry + legAb,
    thCy + th.ry + legTh,
    hdCy + hd.ry
  );

  // Normalize so the highest point sits at PAD from the top edge.
  const shift = PAD - top;
  hdCy += shift;
  thCy += shift;
  abCy += shift;

  const w = Math.ceil(hdCx + hd.rx + JAW + RIGHT);
  const h = Math.ceil(bottom + shift + PAD);

  return {
    w,
    h,
    ab: { cx: abCx, cy: abCy, ...ab },
    th: { cx: thCx, cy: thCy, ...th },
    hd: { cx: hdCx, cy: hdCy, ...hd },
    hinge: { x: hdCx + hd.rx - 1, y: hdCy }, // jaws pivot at the front of the head
  };
}

/** Grid dimensions (cells) for a stage — controller multiplies by PX for CSS px. */
export function bugCell(stage: number): { w: number; h: number } {
  const { w, h } = layout(stage);
  return { w, h };
}

// ── Segment layers (each rendered into its own full-size grid so they align) ──

function abdomenLayer(L: BugLayout): string {
  const grid = makeGrid(L.w, L.h);
  fillEllipse(grid, L.ab.cx, L.ab.cy, L.ab.rx, L.ab.ry, 'W');
  shadeBlob(grid, { highlight: true });

  // Segmentation ribs: faint vertical bands across the lower belly → reads as a
  // segmented abdomen. Every 3rd column, shade the lower ~55% interior.
  for (let x = 0; x < L.w; x++) {
    if ((x - Math.round(L.ab.cx - L.ab.rx)) % 3 !== 2) continue;
    for (let y = Math.round(L.ab.cy); y < L.h; y++) {
      if (grid[y]?.[x] === 'W' || grid[y]?.[x] === 'd') {
        // only rib the interior, never overwrite the bottom contour
        if (grid[y + 1]?.[x] != null) grid[y]![x] = 'd';
      }
    }
  }

  // One rear leg trailing back under the abdomen, rooted into the body.
  const legLen = 4 + Math.round(L.ab.ry * 0.4);
  drawLeg(grid, Math.round(L.ab.cx + L.ab.rx * 0.15), Math.round(L.ab.cy + L.ab.ry) - 1, -1, legLen);

  return `<g class="bh-seg bh-abdomen">${gridToRects(grid)}</g>`;
}

function thoraxLayer(L: BugLayout): string {
  const grid = makeGrid(L.w, L.h);
  fillEllipse(grid, L.th.cx, L.th.cy, L.th.rx, L.th.ry, 'W');
  shadeBlob(grid, { highlight: true });

  // Two legs under the thorax, splayed front/back, rooted into the body.
  const footY = Math.round(L.th.cy + L.th.ry) - 1;
  const legLen = 4 + Math.round(L.th.ry * 0.4);
  drawLeg(grid, Math.round(L.th.cx - L.th.rx * 0.4), footY, -1, legLen);
  drawLeg(grid, Math.round(L.th.cx + L.th.rx * 0.4), footY, 1, legLen);

  return `<g class="bh-seg bh-thorax">${gridToRects(grid)}</g>`;
}

function headLayer(L: BugLayout): string {
  const grid = makeGrid(L.w, L.h);
  fillEllipse(grid, L.hd.cx, L.hd.cy, L.hd.rx, L.hd.ry, 'W');
  shadeBlob(grid, { highlight: true });

  // Big red compound eye, upper-front, with a single white glint.
  const eyeX = Math.round(L.hd.cx + L.hd.rx * 0.25);
  const eyeY = Math.round(L.hd.cy - L.hd.ry * 0.4);
  for (const [dx, dy] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ] as const) {
    plot(grid, eyeX + dx, eyeY + dy, 'R');
  }
  plot(grid, eyeX + 1, eyeY, 'g'); // glint

  // Two antennae sweeping up-forward off the top of the head.
  const antX = Math.round(L.hd.cx + L.hd.rx * 0.1);
  const antY = Math.round(L.hd.cy - L.hd.ry);
  plot(grid, antX, antY - 1, 'L');
  plot(grid, antX + 1, antY - 2, 'L');
  plot(grid, antX + 2, antY - 2, 'L');
  plot(grid, antX - 1, antY - 1, 'L');
  plot(grid, antX - 2, antY - 2, 'L');

  return `<g class="bh-seg bh-head">${gridToRects(grid)}</g>`;
}

function wingLayer(L: BugLayout): string {
  const grid = makeGrid(L.w, L.h);
  // A long translucent wing hinged at the thorax and swept back over the
  // abdomen. Kept see-through (CSS opacity) so length never reads as a slab.
  const wingCx = L.th.cx - L.th.rx * 0.95;
  const wingCy = L.th.cy - L.th.ry - 1;
  const wingRx = L.th.rx * 2.7;
  const wingRy = Math.max(2, L.th.ry * 0.62);
  fillEllipse(grid, wingCx, wingCy, wingRx, wingRy, 'A');
  return `<g class="bh-wing">${gridToRects(grid)}</g>`;
}

function jawLayers(L: BugLayout): string {
  const top = makeGrid(L.w, L.h);
  const bot = makeGrid(L.w, L.h);
  const len = Math.max(2, Math.round(L.hd.rx * 0.85));
  const thk = Math.max(2, Math.round(L.hd.ry * 0.6));
  const x0 = Math.round(L.hd.cx + L.hd.rx - 1);
  const cy = Math.round(L.hd.cy);

  // Upper jaw: rows above the mouth line, dark bottom edge.
  for (let dy = 0; dy < thk; dy++) {
    const y = cy - 1 - dy;
    for (let dx = 0; dx <= len; dx++) plot(top, x0 + dx, y, dy === 0 ? 'M' : 'W');
  }
  // Lower jaw: rows below the mouth line, dark top edge.
  for (let dy = 0; dy < thk; dy++) {
    const y = cy + dy;
    for (let dx = 0; dx <= len; dx++) plot(bot, x0 + dx, y, dy === 0 ? 'M' : 'W');
  }

  // The jaws pivot at the hinge; transform-box:view-box resolves the origin in
  // the SVG's own grid units (set per-stage here, since the grid grows).
  const o = `style="transform-box:view-box;transform-origin:${L.hinge.x}px ${L.hinge.y}px"`;
  return (
    `<g class="bh-jaw-top" ${o}>${gridToRects(top)}</g>` +
    `<g class="bh-jaw-bot" ${o}>${gridToRects(bot)}</g>`
  );
}

/**
 * White pixel fly in profile for a given fatness `stage`. Higher stage = denser
 * grid (more pixels) at the SAME on-screen pixel size — it gains detail, not
 * crunch. Layers are ordered back→front: wing, abdomen, thorax, head, jaws.
 */
export function bugSprite(stage = 0): string {
  const L = layout(stage);
  return (
    `<svg viewBox="0 0 ${L.w} ${L.h}" width="${L.w * PX}" height="${L.h * PX}" ` +
    `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" ` +
    `preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
    wingLayer(L) +
    abdomenLayer(L) +
    thoraxLayer(L) +
    headLayer(L) +
    jawLayers(L) +
    `</svg>`
  );
}

// ── Weapon sprites (fixed matrices) ───────────────────────────────────────────

// 10-wide aerosol can: nozzle button on top, labelled teal canister.
const SPRAY_ROWS = [
  '...NN.....',
  '..NNNN....',
  '..N..N....',
  '.CCCCCC...',
  '.CCCCCC...',
  '.CllllC...',
  '.CllllC...',
  '.CCCCCC...',
  '.CccccC...',
  '.CccccC...',
  '.CCCCCC...',
  '.cccccc...',
];

// 9-wide pixel mallet: chunky head on a short handle.
const HAMMER_ROWS = [
  ' HHHHHHH ',
  'HHHHHHHHH',
  'HhhhhhhhH',
  'HHHHHHHHH',
  '    SS   ',
  '    Ss   ',
  '    SS   ',
  '    Ss   ',
  '    SS   ',
];

/** Render a standalone sprite matrix (used for the weapon icons/cursors). */
function spriteOf(rows: readonly string[]): string {
  const h = rows.length;
  const w = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const grid = makeGrid(w, h);
  rows.forEach((row, y) => [...row].forEach((ch, x) => plot(grid, x, y, ch)));
  return (
    `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" ` +
    `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" ` +
    `preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
    `${gridToRects(grid)}</svg>`
  );
}

/** Pixel mallet used both as the menu icon and the swinging cursor. */
export function hammerSprite(): string {
  return spriteOf(HAMMER_ROWS);
}

/** Aerosol can — the lethal weapon icon/cursor. */
export function spraySprite(): string {
  return spriteOf(SPRAY_ROWS);
}

// Big grabbing hand — open while hovering the fly, a clenched fist while it
// chokes/holds it. Fingers point down so it reads as grabbing from above.
const HAND_OPEN_ROWS = [
  '....KKKK....',
  '...KKKKKK...',
  '..KKKKKKKK..',
  '.KKKKKKKKKK.',
  'KKKKKKKKKKKK',
  'KKKKKKKKKKKK',
  'KK.KK.KK.KK.',
  'KK.KK.KK.KK.',
  'KK.KK.KK.KK.',
  'Kk.Kk.Kk.Kk.',
];

const HAND_GRAB_ROWS = [
  '..KKKKKKKK...',
  '.KKKKKKKKKK..',
  'KKKKKKKKKKKK.',
  'KnKKnKKnKKnK.',
  'KKKKKKKKKKKK.',
  'KKKKKKKKKKKKk',
  'KKKKKKKKKKKKk',
  'KKKKKKKKKKKK.',
  '.KKKKKKKKKK..',
  '..KKKKKKKK...',
];

/** Grabbing hand cursor — open (hover) or clenched fist (gripping the fly). */
export function handSprite(grab = false): string {
  return spriteOf(grab ? HAND_GRAB_ROWS : HAND_OPEN_ROWS);
}

/** Natural aspect ratio (width / height) of the stage-0 bug, for sizing. */
export const BUG_ASPECT = (() => {
  const { w, h } = bugCell(0);
  return w / h;
})();
