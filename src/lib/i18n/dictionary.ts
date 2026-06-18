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
//
// VOICE: first-person, plain, conversational — like Alexis talking to you in
// person. No taglines, no jargon, no marketing-speak. ES is Colombian neutral (tú).

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
    hero_status: 'AI ENGINEER · HARNESS ENGINEERING · REMOTE',
    hero_h1: 'Hi, I’m Alexis.',
    hero_h1_accent: 'I make AI you can actually trust.',
    hero_sub:
      'I’m an AI engineer. The real skill isn’t writing prompts — it’s setting AI up so it does the job right instead of guessing. I give it the right tools, the right context, and a way to check its own work, so what comes out is something you can ship with confidence. Full-stack underneath: Next.js, Node, Python.',
    hero_cta_hire: 'Hire me',
    hero_cta_cv: 'Download CV',
    hero_scroll: 'Scroll',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'ABOUT',
    about_h2: 'Here’s how I work.',
    about_p1:
      'I’m Alexis, an AI engineer with 5+ years shipping web products from start to finish. What I’m best at is taking a messy, half-defined problem and owning it end to end — scoping it, building it, and getting it to production.',
    about_p2:
      'These last couple of years I went all-in on AI — but not the “throw a prompt and hope” kind. I treat an AI agent like a new teammate: I’m clear about what it should do, what to leave alone, and how it checks its own work before it gets to me. That’s why what I hand over is dependable, not a gamble.',
    about_p3:
      'Right now I lead the frontend at anai, an AI content-generation SaaS. I work remotely, ship fast, sweat the details, and care about the person on the other side of the screen as much as the code.',
    stat_years: 'Years shipping to production',
    stat_projects: 'Products in production',
    stat_tech: 'Units monitored at iMometrics',

    // ── Harness method ─────────────────────────────────────────────────────
    harness_label: 'THE METHOD',
    harness_h2: 'How I make AI reliable.',
    harness_sub:
      'Prompting alone is a coin flip. What makes AI dependable is how you set it up — four things, and none of them is writing code.',
    harness_p1_title: 'Fewer tools, better results',
    harness_p1_desc:
      'I give it only what the task needs — fewer tools, fewer ways to mess up. Sometimes leaving an agent with a single tool is what takes it from “usually works” to “always works.”',
    harness_p2_title: 'Context, like a new hire',
    harness_p2_desc:
      'I explain it like I would to someone new on the team: what to do, where to look, what to leave alone. No guessing, no making up its own path.',
    harness_p3_title: 'It checks its own work',
    harness_p3_desc:
      'Before anything reaches me, it runs the tests, reads the logs, tries the endpoints — and fixes itself until everything passes.',
    harness_p4_title: 'Step by step, not all at once',
    harness_p4_desc:
      'No “just build the whole thing.” I break it into steps and check each one — not at the end, after it has touched a hundred files.',
    harness_close:
      'So I’m the one steering, not the one cleaning up after the AI.',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'THE STACK',
    skills_h2: 'The tools I work with.',
    skills_sub:
      'I know my tools well, and I pick up whatever a project needs — fast.',
    skills_ai_title: 'Reliable AI agents',
    skills_ai_desc:
      'I build agents that hold up in production — set up with the right tools, context and a way to check themselves — so real people can depend on them every day.',
    skills_core: 'Core focus',
    skills_loop: 'A typical agent loop',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra & Tools',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'SELECTED WORK',
    projects_h2: 'A few things I’ve built.',
    projects_sub:
      'Real products with real users — not tutorial exercises.',
    projects_view: 'Open',
    projects_code: 'Code',
    work_earlier: 'Earlier — Frontend Developer @ K Gumi & Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'How I can help.',
    services_sub:
      'I’m available for remote work, full-time or by project. Tell me what you need and we’ll figure out how to make it happen.',
    svc1_title: 'AI agents you can rely on',
    svc1_desc:
      'Agents and automations set up properly — the right tools, the right context, and real checks — so they’re solid enough to put in front of real users.',
    svc2_title: 'Make your AI dependable',
    svc2_desc:
      'Your AI works sometimes and you don’t know why? I set it up the right way — tools, context, tests and checks at every step — so it goes from “sometimes” to something your team can count on.',
    svc3_title: 'Full-stack AI products',
    svc3_desc:
      'Web apps end to end with AI built in properly — quick to launch, solid underneath, and made so the AI parts don’t fall apart as you grow.',
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
    contact_h2: 'Want to work together?',
    contact_sub:
      'Open to remote roles, contracts or consulting — anywhere in the world. Drop me a line and I’ll usually get back to you the same day.',
    contact_email: 'Email',
    contact_whats: 'WhatsApp',
    contact_linkedin: 'LinkedIn',
    contact_github: 'GitHub',
    contact_cta: 'Get in touch',

    // ── Shared / Footer ───────────────────────────────────────────────────
    available: 'Available for remote work',
    cv: 'Download CV',
    footer_rights: 'All rights reserved.',
    footer_built: 'Made with care.',
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
    hero_status: 'AI ENGINEER · HARNESS ENGINEERING · REMOTO',
    hero_h1: 'Hola, soy Alexis.',
    hero_h1_accent: 'Hago que la IA sea confiable de verdad.',
    hero_sub:
      'Soy AI engineer. Lo que de verdad importa no es escribir prompts — es preparar bien la IA para que haga el trabajo como toca, sin adivinar. Le doy las herramientas y el contexto que necesita, y una forma de revisar su propio trabajo, para que lo que entrega sea algo que puedas usar con confianza. Full-stack por debajo: Next.js, Node, Python.',
    hero_cta_hire: 'Contrátame',
    hero_cta_cv: 'Descargar CV',
    hero_scroll: 'Baja',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'SOBRE MÍ',
    about_h2: 'Te cuento cómo trabajo.',
    about_p1:
      'Soy Alexis, AI engineer con 5+ años entregando productos web de principio a fin. En lo que mejor me muevo es en tomar un problema desordenado y a medio definir, apropiármelo de punta a punta — definirlo, construirlo y llevarlo a producción.',
    about_p2:
      'Estos últimos años me metí de lleno en la IA — pero no del tipo “tiro un prompt y a ver qué sale”. Trato a un agente de IA como a alguien nuevo en el equipo: le dejo claro qué hacer, qué no tocar y cómo revisar su propio trabajo antes de que llegue a mí. Por eso lo que entrego es confiable, no una lotería.',
    about_p3:
      'Hoy lidero el frontend en anai, un SaaS de generación de contenido con IA. Trabajo remoto, entrego rápido, cuido los detalles y me importa la persona del otro lado de la pantalla tanto como el código.',
    stat_years: 'Años entregando a producción',
    stat_projects: 'Productos en producción',
    stat_tech: 'Unidades monitoreadas en iMometrics',

    // ── Harness method ─────────────────────────────────────────────────────
    harness_label: 'EL MÉTODO',
    harness_h2: 'Cómo hago que la IA sea confiable.',
    harness_sub:
      'Solo con prompts es jugar a la suerte. Lo que hace confiable a la IA es cómo la preparas — cuatro cosas, y ninguna es escribir código.',
    harness_p1_title: 'Menos herramientas, mejores resultados',
    harness_p1_desc:
      'Le doy solo lo que la tarea necesita — menos herramientas, menos formas de equivocarse. A veces dejarle una sola herramienta es lo que lo lleva de “casi siempre funciona” a “siempre funciona”.',
    harness_p2_title: 'Contexto, como a alguien nuevo',
    harness_p2_desc:
      'Se lo explico como a alguien que recién entra al equipo: qué hacer, dónde mirar, qué no tocar. Sin adivinar ni inventarse el camino.',
    harness_p3_title: 'Revisa su propio trabajo',
    harness_p3_desc:
      'Antes de que algo llegue a mí, corre las pruebas, lee los logs, prueba los endpoints — y se corrige solo hasta que todo pasa.',
    harness_p4_title: 'Paso a paso, no todo de una',
    harness_p4_desc:
      'Nada de “hazme todo de una”. Lo divido en pasos y reviso cada uno — no al final, cuando ya tocó cien archivos.',
    harness_close:
      'Así soy yo el que va al mando, no el que limpia lo que la IA dejó roto.',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'EL STACK',
    skills_h2: 'Con esto trabajo.',
    skills_sub:
      'Conozco bien mis herramientas y aprendo rápido lo que el proyecto pida.',
    skills_ai_title: 'Agentes de IA confiables',
    skills_ai_desc:
      'Construyo agentes que aguantan en producción — con las herramientas y el contexto correctos y una forma de revisarse a sí mismos — para que la gente pueda depender de ellos todos los días.',
    skills_core: 'Foco principal',
    skills_loop: 'Un loop de agente típico',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra y Herramientas',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'TRABAJO SELECCIONADO',
    projects_h2: 'Algunas cosas que construí.',
    projects_sub:
      'Productos de verdad, con usuarios de verdad — no ejercicios de tutorial.',
    projects_view: 'Abrir',
    projects_code: 'Código',
    work_earlier: 'Antes — Frontend Developer en K Gumi y Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'En qué te puedo ayudar.',
    services_sub:
      'Estoy disponible para trabajar remoto, full-time o por proyecto. Cuéntame qué necesitas y vemos cómo lo resolvemos.',
    svc1_title: 'Agentes de IA en los que puedes confiar',
    svc1_desc:
      'Agentes y automatizaciones bien armados — las herramientas justas, el contexto correcto y verificaciones de verdad — sólidos para ponerlos frente a usuarios reales.',
    svc2_title: 'Que tu IA sea confiable',
    svc2_desc:
      '¿Tu IA funciona a veces y no sabes por qué? La preparo como toca — herramientas, contexto, pruebas y revisión en cada paso — para que pase de “a veces” a algo con lo que tu equipo pueda contar.',
    svc3_title: 'Productos full-stack con IA',
    svc3_desc:
      'Apps web de punta a punta con IA bien integrada — rápidas de lanzar, sólidas por debajo y hechas para que la parte de IA no se caiga a medida que creces.',
    svc_cta: 'Empezar un proyecto',

    // ── Testimonials ──────────────────────────────────────────────────────
    test_label: 'TESTIMONIOS',
    test_h2: 'Lo que dicen de mí.',
    test_sub: 'Testimonios reales de clientes y colegas — próximamente.',
    test_ph_quote: 'Testimonio real próximamente — Alexis, manda las citas de tus clientes.',
    test_ph_name: 'Nombre del Cliente',
    test_ph_role: 'Rol · Empresa',

    // ── Contact ───────────────────────────────────────────────────────────
    contact_label: 'CONTACTO',
    contact_h2: '¿Trabajamos juntos?',
    contact_sub:
      'Estoy abierto a roles remotos, contratos o consultoría, en cualquier parte del mundo. Escríbeme y casi siempre te respondo el mismo día.',
    contact_email: 'Correo',
    contact_whats: 'WhatsApp',
    contact_linkedin: 'LinkedIn',
    contact_github: 'GitHub',
    contact_cta: 'Escríbeme',

    // ── Shared / Footer ───────────────────────────────────────────────────
    available: 'Disponible para trabajo remoto',
    cv: 'Descargar CV',
    footer_rights: 'Todos los derechos reservados.',
    footer_built: 'Hecho con cuidado.',
  },
} as const;
