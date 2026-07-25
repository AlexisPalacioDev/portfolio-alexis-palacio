/**
 * Single source of truth for time-derived copy.
 *
 * Everything that used to hardcode "5+ years" — the hero badge, the About stat
 * tile, the bio paragraph — reads from here, so the numbers recompute on every
 * build from ONE constant instead of drifting out of date by hand.
 */
export const CAREER_START_YEAR = 2020;

/** Whole years of experience from the career start to now (min 1). */
export function yearsOfExperience(now: Date = new Date()): number {
  return Math.max(1, now.getFullYear() - CAREER_START_YEAR);
}

/** The number shown wherever "years of experience" appears. */
export const EXPERIENCE_YEARS = yearsOfExperience();

/** "6+" — the badge/stat label. */
export const EXPERIENCE_LABEL = `${EXPERIENCE_YEARS}+`;

/**
 * Replace the {YEARS} token in copy with the years-of-experience value —
 * computed with whatever "now" is: the build date on the server (SSR), the
 * visitor's clock in the browser. Run by both t() (build) and applyLang
 * (client), so the bio copy stays live even on a build shipped last year.
 */
export function resolveExperience(text: string): string {
  return text.replace(/\{YEARS\}/g, String(yearsOfExperience()));
}
