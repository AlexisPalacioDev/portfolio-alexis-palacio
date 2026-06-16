# Alexis Palacio — Portfolio

Personal portfolio site for Alexis Palacio, AI Engineer & Full-Stack Developer.

**Live:** [alexispalacio.dev](https://alexispalacio.dev)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 5](https://astro.build) — static output, no adapter |
| Styles | [Tailwind 4](https://tailwindcss.com) via `@tailwindcss/vite` (no PostCSS) |
| Fonts | Fontsource — Space Grotesk + JetBrains Mono (self-hosted, no CDN) |
| State | [Nano Stores](https://github.com/nanostores/nanostores) + persistent atom for lang |
| Language | TypeScript (strict) |
| Unit tests | Vitest |
| E2E tests | Playwright (Chromium, headless) |
| Deploy | Any static host — Vercel recommended (see `vercel.json`) |

---

## Scripts

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Build static site to dist/
npm run preview    # Preview production build (needed for E2E tests)
npm run test       # Run Vitest unit tests
npm run test:e2e   # Run Playwright E2E tests (requires `npm run preview` running)
```

---

## Content & Data Model

All content lives in `src/lib/data/work.ts` as a typed array of `WorkItem`.

Each item has:
- Bilingual fields (`Localized<string>` — `{ en: string, es: string }`) for: `period`, `role`, `kind`, `status`, `desc`, `bullets`
- Shared fields: `id`, `company`, `name`, `accent` (hex), `cover` (Astro image asset), `links`, `tags`, `statusKey`

To add a project: add an entry to the `work` array in `src/lib/data/work.ts` and place its cover image in `src/assets/`.

---

## i18n (EN / ES)

- Dictionary: `src/lib/i18n/dictionary.ts` — flat key/value, both languages, `as const`
- Atom: `$lang` in `src/lib/i18n/store.ts` — persisted in localStorage, defaults to `'en'`
- Swap mechanism: `src/lib/i18n/apply.ts` — `querySelectorAll('[data-i18n]')` on toggle
- EN/ES key parity is enforced by TypeScript (compile error) and Vitest (runtime assertion)

---

## How to Deploy

### Vercel (recommended)

1. Import the repository on [vercel.com](https://vercel.com)
2. Vercel auto-detects the `vercel.json` — no further config needed
3. Set domain to `alexispalacio.dev` in project settings

### Any Static Host (Netlify, Cloudflare Pages, GitHub Pages)

```bash
npm run build   # outputs to dist/
```

Upload or point your host to the `dist/` directory.

For Cloudflare Pages: set build command `npm run build`, output `dist`.  
For GitHub Pages: set `base` in `astro.config.ts` if serving from a subpath (e.g., `base: '/portfolio'`).

---

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |
| Total JS payload (gzip) | ≤ 50 KB |
| LCP candidate | Portrait image (above fold, `fetchpriority="high"`) |
| CLS | ≈ 0 (explicit width/height on all images) |

Current JS payload: **~5.6 KB gzip** (3 islands: LangToggle 0.4 KB + ProjectDeck 1.5 KB + Nano Stores 3.9 KB).

---

## Known TBD

- **Testimonials**: placeholder cards — real quotes pending from clients
- **Sticker Drops**: description and stack pending confirmation
- **OG image** (`public/og-image.png`): currently the anai cover — replace with a real 1200×630 social card

---

## Project Structure

```
src/
  components/
    sections/    Static .astro sections (Hero, About, Stack, Work, Services, Testimonials, Contact, Footer)
    islands/     Interactive units (HeroCanvas, ProjectDeck, LangToggle)
    ui/          Shared presentational partials (Eyebrow, Cta, StatTile)
  layouts/
    BaseLayout.astro
  lib/
    i18n/        Lang atom, dictionary, types, apply
    data/        work[] array + WorkItem type
    deck/        computeSlot() + buildCardTransform() (pure, tested)
    dom/         reveals, countUp, scrollProgress, activeNav
  styles/
    global.css   Tailwind 4 @theme tokens + utilities + animations
  pages/
    index.astro  Single page
public/
  favicon.svg
  Alexis-Palacio-CV.pdf
  og-image.png
  robots.txt
tests/
  unit/          Vitest — slot math, i18n parity, work shape, countUp math
  e2e/           Playwright — lang toggle, deck, CTAs, i18n
```
