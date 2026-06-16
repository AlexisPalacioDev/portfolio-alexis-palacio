import type { I18N } from './dictionary';

// 'en' | 'es'  — derived from the dictionary so it is always in sync
export type Lang = keyof typeof I18N;

// Union of every key present in the EN dictionary
export type TranslationKey = keyof (typeof I18N)['en'];

// Compile-time parity assertion:
// If ES is missing a key that EN has → `(typeof I18N)['es']` will not extend
// `Record<TranslationKey, string>` and the assignment below is a type error.
// If EN is missing a key that ES has → the second extends clause fails.
// Both directions must hold simultaneously.
type AssertParity = (typeof I18N)['es'] extends Record<TranslationKey, string>
  ? Record<TranslationKey, string> extends (typeof I18N)['es']
    ? true
    : never
  : never;

// This const forces TypeScript to evaluate AssertParity at compile time.
// Changing one language's key set without updating the other is a build error.
const _parity: AssertParity = true;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void _parity;
