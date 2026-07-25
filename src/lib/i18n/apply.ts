// apply.ts — runtime i18n swap
//
// Subscribes to $lang and swaps textContent on every element that carries
// a `data-i18n` attribute. The attribute value is a TranslationKey.
//
// This module is imported by LangToggle (which loads client:load) so it
// runs as soon as the toggle hydrates — effectively on page load.
//
// Usage in markup:
//   <span data-i18n="hero_h1">{t('en', 'hero_h1')}</span>
//
// The SSR pass renders default-lang (en) text directly in the HTML so
// static text is visible with zero JS. apply.ts then subscribes and keeps
// the DOM in sync whenever the user changes language.

import { $lang } from './store';
import { I18N } from './dictionary';
import { resolveExperience } from '../data/experience';
import type { TranslationKey } from './types';

export function applyLang(lang: string): void {
  document
    .querySelectorAll<HTMLElement>('[data-i18n]')
    .forEach((el) => {
      const key = el.dataset.i18n as TranslationKey | undefined;
      if (!key) return;

      const dict = lang === 'es' ? I18N.es : I18N.en;
      if (key in dict) {
        el.textContent = resolveExperience(dict[key]);
      }
    });

  // Per-element EN/ES text pairs (for project-specific copy that isn't a shared
  // dictionary key — e.g. the mobile project carousel cards). Each element holds
  // its own translations in data-en / data-es.
  document
    .querySelectorAll<HTMLElement>('[data-en][data-es]')
    .forEach((el) => {
      el.textContent = lang === 'es' ? el.dataset.es ?? '' : el.dataset.en ?? '';
    });

  // Mirror lang onto <html> for CSS/a11y consumers.
  //
  // Guarded on purpose: writing an attribute notifies MutationObservers even
  // when the value is identical. bugHunt watches html[lang] and calls back into
  // applyLang, so an unconditional write here is an infinite loop that freezes
  // the tab on every language switch. Only write when the value actually moves.
  const root = document.documentElement;
  if (root.lang !== lang) root.lang = lang;
  if (root.getAttribute('data-lang') !== lang) root.setAttribute('data-lang', lang);
}

// Subscribe to changes. The subscriber is called immediately with the
// current value, so the initial swap also happens on first load (covering
// the case where localStorage had 'es' and the no-FOUC script already
// set data-lang but hadn't swapped text yet).
export function initI18n(): void {
  $lang.subscribe((lang) => {
    applyLang(lang);
  });
}
