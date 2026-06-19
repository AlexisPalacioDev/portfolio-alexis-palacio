import { describe, it, expect } from 'vitest';
import { work, WORK_STATUS, pick } from '../../src/lib/data/work';
import type { WorkItem } from '../../src/lib/data/work';

const EXPECTED_IDS = [
  'anai',
  'extraction-survivors',
  'imometrics',
  'sticker-drops',
  'apptreeking',
  'carljung',
  'bunnygymwear',
  'todo-automation',
] as const;

const REQUIRED_LOCALIZED_FIELDS: Array<keyof WorkItem> = [
  'period',
  'role',
  'kind',
  'status',
  'desc',
  'bullets',
];

const VALID_STATUS_KEYS = Object.values(WORK_STATUS);

const HEX_RE = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;

describe('work[] data model', () => {
  it('has exactly 8 items', () => {
    expect(work.length).toBe(8);
  });

  it('has items in expected order (most-recent first)', () => {
    EXPECTED_IDS.forEach((id, i) => {
      expect(work[i].id).toBe(id);
    });
  });

  it('all ids are unique', () => {
    const ids = work.map((w) => w.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(work.length);
  });

  describe('each item shape', () => {
    work.forEach((item, i) => {
      describe(`work[${i}] — ${item.id}`, () => {
        it('has a non-empty id', () => {
          expect(item.id).toBeTruthy();
        });

        it('has a non-empty company', () => {
          expect(item.company).toBeTruthy();
        });

        it('has a non-empty name', () => {
          expect(item.name).toBeTruthy();
        });

        it('has a valid hex accent color', () => {
          expect(item.accent).toMatch(HEX_RE);
        });

        it('has a cover asset (string path in Vitest node env; ImageMetadata at build time)', () => {
          // In Vitest (node env) Astro image imports resolve to the string path.
          // At build time (Astro's Vite pipeline) they resolve to ImageMetadata objects.
          // Either is acceptable here — we just assert the value is truthy and not null.
          expect(item.cover).toBeDefined();
          expect(item.cover).not.toBeNull();
          // The src field exists on ImageMetadata; the raw string IS the path in node env.
          const src =
            typeof item.cover === 'object' && item.cover !== null
              ? (item.cover as { src: string }).src
              : (item.cover as unknown as string);
          expect(src).toBeTruthy();
        });

        it('has a links object with link and code (string or null)', () => {
          expect(item.links).toBeDefined();
          expect(item.links.link === null || typeof item.links.link === 'string').toBe(true);
          expect(item.links.code === null || typeof item.links.code === 'string').toBe(true);
        });

        it('has a valid statusKey', () => {
          expect(VALID_STATUS_KEYS).toContain(item.statusKey);
        });

        it('has non-empty tags array', () => {
          expect(Array.isArray(item.tags)).toBe(true);
          expect(item.tags.length).toBeGreaterThan(0);
        });

        // Check all localized fields have both en and es
        REQUIRED_LOCALIZED_FIELDS.forEach((field) => {
          it(`localized field "${field}" has both en and es`, () => {
            const localized = item[field] as { en: unknown; es: unknown };
            expect(localized).toBeDefined();
            expect(localized.en).toBeDefined();
            expect(localized.es).toBeDefined();
          });

          if (field !== 'bullets') {
            it(`localized field "${field}" has non-empty en value`, () => {
              const localized = item[field] as { en: string; es: string };
              expect(localized.en).toBeTruthy();
            });

            it(`localized field "${field}" has non-empty es value`, () => {
              const localized = item[field] as { en: string; es: string };
              expect(localized.es).toBeTruthy();
            });
          } else {
            it('bullets.en is a non-empty array of strings', () => {
              expect(Array.isArray(item.bullets.en)).toBe(true);
              expect(item.bullets.en.length).toBeGreaterThan(0);
              item.bullets.en.forEach((b) => expect(typeof b).toBe('string'));
            });

            it('bullets.es is a non-empty array of strings', () => {
              expect(Array.isArray(item.bullets.es)).toBe(true);
              expect(item.bullets.es.length).toBeGreaterThan(0);
              item.bullets.es.forEach((b) => expect(typeof b).toBe('string'));
            });
          }
        });
      });
    });
  });

  describe('pick() helper', () => {
    it('pick(period, en) returns English period for anai', () => {
      const anai = work[0];
      expect(pick(anai.period, 'en')).toBe('2024 — Present');
    });

    it('pick(period, es) returns Spanish period for anai', () => {
      const anai = work[0];
      expect(pick(anai.period, 'es')).toBe('2024 — Hoy');
    });

    it('pick(desc, en) returns English desc for anai', () => {
      const anai = work[0];
      expect(pick(anai.desc, 'en')).toContain('anai');
    });

    it('pick(bullets, es) returns Spanish bullets array for anai', () => {
      const anai = work[0];
      const bullets = pick(anai.bullets, 'es');
      expect(Array.isArray(bullets)).toBe(true);
      expect(bullets.length).toBeGreaterThan(0);
    });
  });
});
