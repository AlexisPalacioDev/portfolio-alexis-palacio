import { describe, it, expect } from 'vitest';
import { I18N } from '../../src/lib/i18n/dictionary';
import { t, LANG } from '../../src/lib/i18n/store';

describe('i18n dictionary', () => {
  describe('key parity', () => {
    it('EN and ES have identical key sets', () => {
      const enKeys = Object.keys(I18N.en).sort();
      const esKeys = Object.keys(I18N.es).sort();
      expect(enKeys).toEqual(esKeys);
    });

    it('neither language has zero keys', () => {
      expect(Object.keys(I18N.en).length).toBeGreaterThan(0);
      expect(Object.keys(I18N.es).length).toBeGreaterThan(0);
    });

    it('EN and ES have the same key count', () => {
      expect(Object.keys(I18N.en).length).toBe(Object.keys(I18N.es).length);
    });
  });

  describe('t() helper', () => {
    it('returns the correct EN string for hero_h1', () => {
      expect(t(LANG.EN, 'hero_h1')).toBe('Hi, I’m Alexis.');
    });

    it('returns the correct ES string for hero_h1', () => {
      expect(t(LANG.ES, 'hero_h1')).toBe('Hola, soy Alexis.');
    });

    it('returns the correct EN string for hero_status', () => {
      expect(t(LANG.EN, 'hero_status')).toBe('AI ENGINEER · HARNESS ENGINEERING');
    });

    it('returns the correct ES string for hero_cta_hire', () => {
      expect(t(LANG.ES, 'hero_cta_hire')).toBe('Contrátame');
    });

    it('returns the correct EN string for hero_cta_cv', () => {
      expect(t(LANG.EN, 'hero_cta_cv')).toBe('Download CV');
    });

    it('EN and ES hero_h1 values are different (actually translated)', () => {
      expect(t(LANG.EN, 'hero_h1')).not.toBe(t(LANG.ES, 'hero_h1'));
    });

    it('EN and ES nav_about values are different', () => {
      expect(t(LANG.EN, 'nav_about')).not.toBe(t(LANG.ES, 'nav_about'));
    });
  });

  describe('nav keys', () => {
    const navKeys = ['nav_about', 'nav_skills', 'nav_projects', 'nav_services', 'nav_contact'] as const;

    navKeys.forEach((key) => {
      it(`EN and ES both have "${key}" with non-empty values`, () => {
        expect(t(LANG.EN, key)).toBeTruthy();
        expect(t(LANG.ES, key)).toBeTruthy();
      });
    });
  });
});
