// I18N is the single source of truth for all translated strings.
//
// KEY NAMING CONVENTION
// ─────────────────────
// <section>_<element>   e.g.  nav_about, hero_h1, hero_cta_hire
//
// To add a new key in WU-5:
//   1. Add it to `en` first.
//   2. Add the same key to `es`.
//   3. The compile-time AssertParity check in types.ts will catch any drift.
//   4. The Vitest key-parity test is the runtime safety net.
//
// The full copy for all sections ships in WU-5. This file seeds the
// structural contract so the toggle mechanism is demonstrably end-to-end
// before any section is written.

export const I18N = {
  en: {
    // ── Nav ──────────────────────────────────────────────────────────────
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_projects: 'Projects',
    nav_services: 'Services',
    nav_contact: 'Contact',

    // ── Hero ─────────────────────────────────────────────────────────────
    hero_status: 'AI ENGINEER · FULL-STACK · REMOTE',
    hero_h1: 'I orchestrate AI',
    hero_h1_accent: 'to ship real outcomes.',
    hero_sub: 'I design and build production AI systems — RAG pipelines, agent loops, and the full-stack surfaces that make them useful.',
    hero_cta_hire: 'Hire me',
    hero_cta_cv: 'Download CV',
    hero_scroll: 'Scroll ↓',
  },
  es: {
    // ── Nav ──────────────────────────────────────────────────────────────
    nav_about: 'Sobre mí',
    nav_skills: 'Skills',
    nav_projects: 'Proyectos',
    nav_services: 'Servicios',
    nav_contact: 'Contacto',

    // ── Hero ─────────────────────────────────────────────────────────────
    hero_status: 'AI ENGINEER · FULL-STACK · REMOTO',
    hero_h1: 'Orquesto IA',
    hero_h1_accent: 'para entregar resultados reales.',
    hero_sub: 'Diseño y construyo sistemas de IA en producción — pipelines RAG, bucles de agentes y las interfaces full-stack que los hacen útiles.',
    hero_cta_hire: 'Contratame',
    hero_cta_cv: 'Descargar CV',
    hero_scroll: 'Scroll ↓',
  },
} as const;
