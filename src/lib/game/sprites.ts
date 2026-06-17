/**
 * sprites.ts — pixel-art SVG sprites for the "bug hunt" easter-egg game.
 *
 * Pure functions: given parameters, return an SVG markup string. No DOM access
 * and no side effects, so the visuals are trivial to tweak and unit-test in
 * isolation. The controller (bugHunt.ts) is the only thing that touches the DOM.
 *
 * The fly is drawn in SIDE PROFILE, facing right (the controller flips it with
 * scaleX(-1) to face left), and built as LAYERED groups so the stylesheet can
 * animate parts independently:
 *   - `.bh-wing` flaps fast, hinged at the thorax
 *   - `.bh-jaw-top` / `.bh-jaw-bot` are two real jaws that rotate apart on a
 *     shared hinge, revealing the red `.bh-throat` behind them — a proper
 *     Pac-Man chomp (":v"), not a scaling block.
 *
 * Rendering uses `shape-rendering="crispEdges"` so each 1×1 rect stays a hard
 * pixel at any scale — that is what gives the sprites their pixel-art look.
 */

// Palette keyed by the single-char codes used in the pixel matrices below.
// Any char NOT in this map (space, '.') is treated as transparent.
const PALETTE: Record<string, string> = {
  // body
  W: '#F4F4F0', // body (white)
  w: '#C9CBD0', // body shading / edge
  R: '#9B2D2D', // eye (fly red)
  g: '#FFFFFF', // eye glint
  L: '#2A2C33', // legs + antennae
  // wings (kept very translucent by .bh-wing in the stylesheet)
  A: '#DCEAFF',
  a: '#B8CCF5',
  // mouth
  M: '#14151A', // jaw edge / mouth line (dark) — the mouth interior is transparent
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
};

// All bug layers share an 18×12 grid (wider than tall — a fly in profile).
const GRID_W = 18;
const GRID_H = 12;

// The jaws rotate around this point (back of the mouth), in viewBox units.
const HINGE_X = 13;
const HINGE_Y = 6;

// One thin wing sweeping up-and-back from the thorax. Very translucent in CSS.
const WING_ROWS = [
  '...AAA............',
  '..AAAAA...........',
  '...AAAAAA.........',
  '.....AAAAA........',
  '.......AAA........',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
];

// Body: segmented abdomen (left) → thorax → rounded head (right) with a red eye,
// antennae, and three thin legs. The mouth opening (cols 14–17, rows 5–7) is
// left empty here — the throat + jaw layers own it.
const BODY_ROWS = [
  '..............L.L.',
  '.............L.L...',
  '...........WWW.....',
  '.......WWWWWWW.....',
  '....wWWWWWWRRg.....',
  '..wWWWWWWWWRRW.....',
  '.wWWWWWWWWWWWW.....',
  '..wWWWWWWWWWWW.....',
  '...wWWWWWWWWWW.....',
  '.....WWWWWWWW......',
  '....L...L...L.....',
  '...L....L....L....',
];

// Upper jaw (rows 4–6). The bottom edge (row 6) is the dark mouth line.
const JAW_TOP_ROWS = [
  '..................',
  '..................',
  '..................',
  '..................',
  '.............WWWW..',
  '.............WWWW..',
  '.............MMMM..',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
];

// Lower jaw (rows 6–8). The top edge (row 6) is the dark mouth line.
const JAW_BOT_ROWS = [
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '.............MMMM..',
  '.............WWWW..',
  '.............WWW...',
  '..................',
  '..................',
  '..................',
];

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

/** Emit 1×1 pixel rects for one character matrix. */
function renderRects(rows: readonly string[]): string {
  let out = '';
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const fill = PALETTE[char];
      if (!fill) return; // space / '.' / unknown → transparent
      // 1.02 closes hairline seams between adjacent pixels when scaled up.
      out += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
    });
  });
  return out;
}

/** Wrap a matrix in a named group so the stylesheet can target/animate it. */
function layer(rows: readonly string[], className: string): string {
  return `<g class="${className}">${renderRects(rows)}</g>`;
}

/** White pixel fly in profile: flapping wing, red eye, real chomping jaws. */
export function bugSprite(): string {
  return (
    `<svg viewBox="0 0 ${GRID_W} ${GRID_H}" width="100%" height="100%" ` +
    `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" ` +
    `preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
    layer(WING_ROWS, 'bh-wing') +
    layer(BODY_ROWS, 'bh-body') +
    layer(JAW_TOP_ROWS, 'bh-jaw-top') +
    layer(JAW_BOT_ROWS, 'bh-jaw-bot') +
    `</svg>`
  );
}

/** Render a standalone sprite matrix (used for the weapon icons/cursors). */
function spriteOf(rows: readonly string[]): string {
  const h = rows.length;
  const w = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return (
    `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" ` +
    `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" ` +
    `preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
    `${renderRects(rows)}</svg>`
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

/** Natural aspect ratio (width / height) of the bug sprite, for sizing. */
export const BUG_ASPECT = GRID_W / GRID_H;

/** Jaw hinge point (viewBox units) — used by the stylesheet's transform-origin. */
export const JAW_HINGE = { x: HINGE_X, y: HINGE_Y };
