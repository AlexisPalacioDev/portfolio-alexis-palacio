# Handoff: Alexis Palacio — Developer Portfolio

## Overview
A single-page bilingual (EN/ES) developer portfolio for **Alexis Palacio**, a full-stack developer specializing in **AI orchestration / agents / automation**, positioned for remote work and freelance. Dark, brutalist-editorial aesthetic with an interactive "Experience + Projects" deck, an animated hero, and section-by-section scroll snapping.

## About the Design Files
The files in this bundle are **design references created in HTML** (a prototype showing the intended look and behavior) — **not** production code to ship directly. `Portfolio.dc.html` is authored in a proprietary "Design Component" runtime (custom `{{ }}` templating + a `Component` logic class). **Your task is to recreate this design in a real, maintainable stack** — recommended: **Astro or Next.js + React + TypeScript + Tailwind** (Alexis already uses these) — following that project's conventions. Treat the HTML as the source of truth for layout, color, type, copy, and interaction.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interactions are all specified below. Recreate pixel-faithfully, then wire the real data.

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0C0D10` | Page background (near-black) |
| `panel` | `#101218` | Alternate section bg (skills, work, testimonials) |
| `surface` | `#14151A` | Cards, stat tiles |
| `ink` | `#F2F2EE` | Primary text (off-white) |
| `muted` | `#9D9D95` / `#93938B` | Body / secondary text |
| `faint` | `#6E6E66` / `#5E5E58` | Mono labels, captions |
| `line` | `#23252D` | Section dividers / hairlines |
| `line-2` | `#2C2F38` / `#34373F` | Card borders / stronger hairlines |
| **`lime`** | **`#C6F24E`** | **Primary accent** (CTAs, active states, eyebrows) |
| `blue` | `#3D5BFF` | Secondary accent (hard shadows on lime CTAs) |
| `error` | `#FF4D4D` | (legacy) |

**Per-project accent colors** (used on cover art + the active-project label): anai `#5B8DEF`, iMometrics `#8B7CF6`, Sticker Drops `#FF5CA8`, Tripi `#46C97E`, Carl Jung AI `#C6F24E`, BunnyGymWear `#F5C24B`, To-Do Automation `#3DD6C0`.

### Typography
- **Display / body:** `Space Grotesk` (400/500/600/700) — Google Fonts.
- **Mono / labels / eyebrows:** `JetBrains Mono` (400/500/700) — Google Fonts.
- Headlines: `clamp(34px, 5vw, 72px)`, `line-height: 0.98`, `letter-spacing: -2px`, weight 700.
- Hero H1: `clamp(54px, 12vw, 188px)`, `line-height: 0.85`, `letter-spacing: -0.045em`.
- Eyebrows: JetBrains Mono, 12px, weight 700, `letter-spacing: 2px`, uppercase, lime; prefixed with a 2-digit index (`01`–`06`) + a 40px hairline.
- Body: 16–17px, `line-height: 1.6–1.75`, muted.

### Spacing / radius / shadow
- Section padding: `110px 40px` (desktop). Max content width `1280px`.
- Cards: **no border radius** (brutalist) or ~2px; 1px borders.
- Hard offset shadows on CTAs: `box-shadow: 6px 6px 0 #3D5BFF` (lime button) / `4px 4px 0` on smaller.
- Soft card shadows: `0 NNpx NNpx rgba(0,0,0,0.5)`.

---

## Screens / Views (single page; sections)

Fixed top nav (blur, 1px bottom border) with monogram **AP** (lime tile, blue offset shadow), section anchors, and an **EN/ES toggle**. A 3px lime **scroll-progress bar** sits at the very top. Each section is `min-height: 100vh` with `scroll-snap-align: start` (`html { scroll-snap-type: y proximity }`).

1. **Hero (`#home`)** — Eyebrow status pill (pulsing lime dot + "AI ENGINEER · FULL-STACK · REMOTE"), giant H1 ("I orchestrate AI" / lime "to ship real outcomes."), sub-paragraph, two CTAs (lime "Hire me", outline "Download CV"), signature line. Background: an **animated node-network `<canvas>`** (id `hero-canvas`) — light dots + connecting lines on dark, lime highlight near the cursor; plus a giant translucent "AI" watermark. Bottom-center "Scroll ↓" cue.
2. **About (`#about`)** — Eyebrow `01`. Two columns: left = headline + 3 paragraphs + 3 stat tiles (animated count-up: `5+` years, `20+` projects, `16+` technologies); right = portrait photo in a framed card (lime offset shadow) with a `@AlexisPalacioDev ● online` bar.
3. **Stack (`#skills`)** — Eyebrow `02`, panel bg `#101218`. A featured lime-bordered block "AI Orchestration & Agents" (description + a mono agent-loop diagram `user → agent ↳ tool·plan ↳ loop·verify → outcome ✓` + skill chips) over three category cards: Backend, Frontend, Infra & Tools.
4. **Work & Projects (`#projects`)** — Eyebrow `03`, panel bg. **THE KEY INTERACTION** (see below). Two columns: left = live detail of the active item; right = a clickable 3D card deck.
5. **Services / Hire me (`#services`)** — Eyebrow `04`, **full lime background**, dark text. 3 numbered service cards (dark) + CTA.
6. **Testimonials (`#testimonials`)** — Eyebrow `05`, panel bg. 3 dashed-border placeholder quote cards (real quotes TBD).
7. **Contact (`#contact`)** — Eyebrow `06`. Giant headline, 4 contact tiles (Email, WhatsApp, LinkedIn, GitHub — each hover-colored), big lime CTA + outline CV button + availability pill.
8. **Footer** — monogram, copyright, tagline.

---

## Interactions & Behavior

### Work & Projects deck (most important)
- Right column renders a **stack of project cards** (340×438px), absolutely positioned, fanned down-right with depth: slot `s = (index − active + N) % N`; `transform: translate(s*42px, s*16px) scale(1 − s*0.055) skewY(-3deg)`; `z-index: N − s`; cards with `s > 3` are hidden (`opacity:0; pointer-events:none`). Front card (`s===0`) has a lime border.
- **Hover** a card → it lifts & scales up (`translateY(-26px) scale(*1.04)`, lime border, bigger shadow) — "peeks out".
- **Click** a card (or an indicator dot below) → it becomes `active`; the deck re-lays-out with a `.55s cubic-bezier(.2,.7,.2,1)` transition, and the **left column** updates to that item's company · period · status, role, project name + kind, description, "what I did" bullets, tech tags, and Open/Code links.
- Indicator **dots** under the deck (active = lime, scaled 1.25). No auto-rotation (user-driven).
- Transitions: transform `.55s`, opacity `.4s`, easing `cubic-bezier(.2,.7,.2,1)`.

### Other
- **Hero canvas:** `requestAnimationFrame` loop; nodes drift + bounce, repel from cursor; lines drawn between nodes < 132px apart (alpha by distance). Canvas located by `id="hero-canvas"` and resized to its box each frame (DPR-aware).
- **Scroll reveals:** elements with `.rev` fade/slide up (`opacity 0 → 1`, `translateY(26–44px) → 0`) via IntersectionObserver, staggered; failsafe reveals all after 3s.
- **Scroll progress bar** width = scrollTop / scrollHeight.
- **Active nav link** highlights (lime) based on scroll position.
- **EN/ES toggle** swaps every string from a translations dictionary (see State).
- **Count-up** stats animate once when About enters view.
- Hover states on all links/buttons/cards (smooth `.22s` transitions); buttons depress on `:active`.

## State Management
- `lang`: `'en' | 'es'` — drives a full translations dictionary (`I18N[lang]`). All UI copy is bilingual.
- `activeWork`: number — index of the selected project in the deck (default 0).
- `counts`: `{ years, projects, techs }` — animated stat values.
- Hero/canvas, reveals, scroll progress are imperative (no React state).
- Data fetching: none — all content is static data in code (see below). Project preview images are local cover PNGs.

## Content / Data
A `work[]` array (unifies experience + projects). Each item: `company, period, role, name, kind, accent, cover, link, code, status, tags[], desc, bullets[]` — all `desc`/`bullets`/`role`/`period`/`status` bilingual. Items (most-recent first): **anai** (AI content platform, current), **iMometrics** (backend), **Sticker Drops**, **Tripi** (apptreeking marketplace), **Carl Jung AI**, **BunnyGymWear**, **To-Do Automation**. Earlier roles (K Gumi, Wiptool, 2020–2024) noted as a footnote. ⚠️ "Sticker Drops" desc + stack are placeholder — confirm with Alexis. Real contact: `alexis26-93@live.com`, `+57 321 655 1350` (WhatsApp `573216551350`), LinkedIn `in/poisoneddog`, GitHub `AlexisPalacioDev`.

## Assets
In `assets/`:
- `alexis-photo.jpg` — portrait (About).
- `cover-*.png` (1000×600) — branded project cover art (anai, sticker, tripi, carljung, bunny, todo, imometrics). These are designed placeholders (reliable) standing in for live screenshots; you may swap for real OG/screenshot images.
- `favicon.svg` — AP monogram (lime).
- `Alexis-Palacio-CV.pdf` — downloadable CV (linked from hero + contact).

## Files
- `Portfolio.dc.html` — the full design (template + logic). Open in a browser to view/interact. Read it as the spec; do not ship the `.dc.html` runtime.
- `assets/` — all images + CV + favicon.

## Notes for implementation
- No external UI kit; everything is bespoke. Use Tailwind utilities or CSS Modules.
- gsap is **not** required (the current deck uses pure CSS transforms/transitions).
- Fonts via Google Fonts (`Space Grotesk`, `JetBrains Mono`).
- Keep the EN/ES dictionary structure; consider `next-intl` / `astro-i18n` if using those frameworks.
