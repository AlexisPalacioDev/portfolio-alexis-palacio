/**
 * liveYears.ts — recompute years-of-experience in the BROWSER.
 *
 * The build bakes the correct number, but a build shipped in a previous year
 * would otherwise show a stale count until the next deploy. This runs on every
 * page load with the visitor's own clock, so the hero badge and the About stat
 * are always current. (The bio copy is handled separately by the i18n {YEARS}
 * token, which applyLang re-resolves live on load and on every language switch.)
 */
import { yearsOfExperience } from '../data/experience';

export function initLiveYears(): void {
  const years = yearsOfExperience();

  // Hero badge: "EST. 2020 · <n>+ yrs"
  document.querySelectorAll<HTMLElement>('[data-exp-years]').forEach((el) => {
    el.textContent = String(years);
  });

  // About "years" stat — its label carries data-i18n="stat_years"; the tile
  // above it holds data-count (the count-up target) and the displayed value.
  const label = document.querySelector('[data-i18n="stat_years"]');
  const tile = label?.closest<HTMLElement>('[data-count]');
  if (tile) {
    tile.setAttribute('data-count', String(years)); // set before count-up reads it
    const value = tile.querySelector<HTMLElement>('[data-stat-value]');
    if (value) value.textContent = `${years}+`;
  }
}
