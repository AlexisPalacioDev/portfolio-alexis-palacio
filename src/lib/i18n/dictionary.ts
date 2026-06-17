// I18N is the single source of truth for all translated strings.
//
// KEY NAMING CONVENTION
// ─────────────────────
// <section>_<element>   e.g.  nav_about, hero_h1, hero_cta_hire
//
// To add a new key:
//   1. Add it to `en` first.
//   2. Add the same key to `es`.
//   3. The compile-time AssertParity check in types.ts will catch any drift.
//   4. The Vitest key-parity test is the runtime safety net.

export const I18N = {
  en: {
    // ── Nav ──────────────────────────────────────────────────────────────
    nav_about: 'About',
    nav_skills: 'Stack',
    nav_projects: 'Work',
    nav_services: 'Hire me',
    nav_testimonials: 'Testimonials',
    nav_contact: 'Contact',

    // ── Hero ─────────────────────────────────────────────────────────────
    hero_status: 'AI ENGINEER · FULL-STACK · REMOTE',
    hero_h1: 'I orchestrate AI',
    hero_h1_accent: 'to ship real outcomes.',
    hero_sub:
      'Full-stack developer specialized in AI agents, automation harnesses and LLM orchestration — agents, loops, MCP, n8n. 5 years turning ideas into products that actually run in production.',
    hero_cta_hire: 'Hire me',
    hero_cta_cv: 'Download CV',
    hero_scroll: 'Scroll',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'ABOUT',
    about_h2: "I don't just write code. I make AI get the job done.",
    about_p1:
      'Full-stack developer with 5+ years building web products end to end. Over the last two years I pivoted hard into AI orchestration: my edge is not a single language — it\'s wiring models, tools and data into systems that hit a goal on their own.',
    about_p2:
      "I've built voice agents connected to external sources through MCP, automation harnesses with n8n, and LLM pipelines running both in the cloud and locally (Ollama, OpenRouter). Solid backend foundations in PHP/CakePHP, Node and Python, with a modern frontend (React, Next.js, Tailwind).",
    about_p3:
      "Right now I'm engineering AI content generation at anai. I work remote, ship fast, and I'm hungry — in every sense of the word.",
    stat_years: 'Years shipping',
    stat_projects: 'Projects delivered',
    stat_tech: 'Technologies',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'THE STACK',
    skills_h2: 'Built to orchestrate, not just to code.',
    skills_sub:
      'A T-shaped toolkit: deep in AI orchestration & automation, broad across the full stack.',
    skills_ai_title: 'AI Orchestration & Agents',
    skills_ai_desc:
      "Designing the loops, tools and guardrails that let models accomplish real objectives — not demos.",
    skills_core: 'Core focus',
    skills_loop: 'A typical agent loop',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra & Tools',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'SELECTED WORK',
    projects_h2: 'Real products I worked on.',
    projects_sub:
      'AI, automation and full-stack — from marketplaces with escrow to content engines.',
    projects_view: 'Open',
    projects_code: 'Code',
    work_earlier: 'Earlier — Frontend Developer @ K Gumi & Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'Hire me for the hard part.',
    services_sub: 'Available for full-time remote, contracts and AI consulting. Let\'s build.',
    svc1_title: 'AI Agents & Automation',
    svc1_desc:
      'Custom agents, n8n harnesses, MCP integrations and bots on WhatsApp / Telegram that actually move the needle.',
    svc2_title: 'Full-Stack Development',
    svc2_desc:
      'Web apps end to end — Next.js, React, Supabase, Node, payments and clean APIs that scale.',
    svc3_title: 'AI Strategy & Consulting',
    svc3_desc:
      'LLM orchestration, harness & loop design, cloud + local models. I help teams ship AI that works.',
    svc_cta: 'Start a project',

    // ── Testimonials ──────────────────────────────────────────────────────
    test_label: 'TESTIMONIALS',
    test_h2: 'What people say.',
    test_sub: 'Real quotes from clients & teammates coming soon.',
    test_ph_quote: 'Real testimonial coming soon — Alexis, send over your client quotes.',
    test_ph_name: 'Client Name',
    test_ph_role: 'Role · Company',

    // ── Contact ───────────────────────────────────────────────────────────
    contact_label: 'CONTACT',
    contact_h2: "Let's build something.",
    contact_sub:
      'Open to remote roles, contracts and consulting worldwide. I usually reply same day.',
    contact_email: 'Email',
    contact_whats: 'WhatsApp',
    contact_linkedin: 'LinkedIn',
    contact_github: 'GitHub',
    contact_cta: 'Get in touch',

    // ── Shared / Footer ───────────────────────────────────────────────────
    available: 'Available for remote work',
    cv: 'Download CV',
    footer_rights: 'All rights reserved.',
    footer_built: 'Designed & built with intent.',
  },

  es: {
    // ── Nav ──────────────────────────────────────────────────────────────
    nav_about: 'Sobre mí',
    nav_skills: 'Stack',
    nav_projects: 'Proyectos',
    nav_services: 'Contrátame',
    nav_testimonials: 'Testimonios',
    nav_contact: 'Contacto',

    // ── Hero ─────────────────────────────────────────────────────────────
    hero_status: 'INGENIERO IA · FULL-STACK · REMOTO',
    hero_h1: 'Orquesto IA',
    hero_h1_accent: 'para entregar resultados reales.',
    hero_sub:
      'Desarrollador full-stack especializado en agentes de IA, harnesses de automatización y orquestación de LLMs — agentes, loops, MCP, n8n. 5 años convirtiendo ideas en productos que de verdad corren en producción.',
    hero_cta_hire: 'Contratame',
    hero_cta_cv: 'Descargar CV',
    hero_scroll: 'Baja',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'SOBRE MÍ',
    about_h2: 'No solo escribo código. Hago que la IA cumpla el objetivo.',
    about_p1:
      "Desarrollador full-stack con 5+ años construyendo productos web de punta a punta. En los últimos dos años me volqué a la orquestación de IA: mi fuerte no es un solo lenguaje — es conectar modelos, herramientas y datos en sistemas que logran una meta por sí solos.",
    about_p2:
      "He construido agentes de voz conectados a fuentes externas vía MCP, harnesses de automatización con n8n y pipelines de LLM corriendo en la nube y en local (Ollama, OpenRouter). Base sólida en PHP/CakePHP, Node y Python, con frontend moderno (React, Next.js, Tailwind).",
    about_p3:
      "Hoy estoy desarrollando generación de contenido con IA en anai. Trabajo remoto, entrego rápido y tengo hambre — en todos los sentidos de la palabra.",
    stat_years: 'Años entregando',
    stat_projects: 'Proyectos entregados',
    stat_tech: 'Tecnologías',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'EL STACK',
    skills_h2: 'Hecho para orquestar, no solo para codear.',
    skills_sub:
      'Un perfil en T: profundidad en orquestación de IA y automatización, amplitud en todo el stack.',
    skills_ai_title: 'Orquestación de IA y Agentes',
    skills_ai_desc:
      "Diseño los loops, herramientas y guardrails que permiten a los modelos cumplir objetivos reales — no demos.",
    skills_core: 'Foco principal',
    skills_loop: 'Un loop de agente típico',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra y Herramientas',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'TRABAJO SELECCIONADO',
    projects_h2: 'Productos reales en los que trabajé.',
    projects_sub:
      'IA, automatización y full-stack — desde marketplaces con escrow hasta motores de contenido.',
    projects_view: 'Abrir',
    projects_code: 'Código',
    work_earlier: 'Antes — Frontend Developer en K Gumi y Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'Contrátame para la parte difícil.',
    services_sub: 'Disponible para remoto full-time, contratos y consultoría en IA. Construyamos.',
    svc1_title: 'Agentes de IA y Automatización',
    svc1_desc:
      'Agentes a medida, harnesses con n8n, integraciones MCP y bots en WhatsApp / Telegram que mueven la aguja.',
    svc2_title: 'Desarrollo Full-Stack',
    svc2_desc:
      'Apps web de punta a punta — Next.js, React, Supabase, Node, pagos y APIs limpias que escalan.',
    svc3_title: 'Estrategia y Consultoría IA',
    svc3_desc:
      'Orquestación de LLMs, diseño de harness y loops, modelos cloud + local. Ayudo a equipos a entregar IA que funciona.',
    svc_cta: 'Empezar un proyecto',

    // ── Testimonials ──────────────────────────────────────────────────────
    test_label: 'TESTIMONIOS',
    test_h2: 'Lo que dicen de mí.',
    test_sub: 'Testimonios reales de clientes y colegas — próximamente.',
    test_ph_quote: 'Testimonio real próximamente — Alexis, mandá las citas de tus clientes.',
    test_ph_name: 'Nombre del Cliente',
    test_ph_role: 'Rol · Empresa',

    // ── Contact ───────────────────────────────────────────────────────────
    contact_label: 'CONTACTO',
    contact_h2: 'Construyamos algo.',
    contact_sub:
      'Abierto a roles remotos, contratos y consultoría en todo el mundo. Suelo responder el mismo día.',
    contact_email: 'Correo',
    contact_whats: 'WhatsApp',
    contact_linkedin: 'LinkedIn',
    contact_github: 'GitHub',
    contact_cta: 'Hablemos',

    // ── Shared / Footer ───────────────────────────────────────────────────
    available: 'Disponible para trabajo remoto',
    cv: 'Descargar CV',
    footer_rights: 'Todos los derechos reservados.',
    footer_built: 'Diseñado y construido con intención.',
  },
} as const;
