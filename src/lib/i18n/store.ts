import { persistentAtom } from '@nanostores/persistent';
import { I18N } from './dictionary';
import type { Lang, TranslationKey } from './types';

// Const-object pattern (TypeScript skill) — single source of truth,
// runtime values + autocomplete + easier refactoring.
export const LANG = {
  EN: 'en',
  ES: 'es',
} as const;

export type LangValue = (typeof LANG)[keyof typeof LANG];

// $lang persists the user's choice in localStorage under the key 'lang'.
// Default is English. The no-FOUC inline script in BaseLayout reads the
// same key before paint to avoid a flash for returning ES users.
export const $lang = persistentAtom<LangValue>('lang', LANG.EN);

// t() returns the translated string for `key` in `lang`.
// Both parameters are fully typed — invalid keys and invalid langs are
// caught at compile time.
export function t(lang: LangValue, key: TranslationKey): string {
  return I18N[lang as Lang][key];
}
