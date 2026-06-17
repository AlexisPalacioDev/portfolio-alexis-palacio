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
    hero_status: 'FULL-STACK · AI ENGINEER · REMOTE · FREELANCE',
    hero_h1: 'Hi, I’m Alexis.',
    hero_h1_accent: 'I lead products from idea to production.',
    hero_sub:
      'Lead full-stack developer specializing in AI. I architect and ship web platforms end to end — from the Next.js frontend to the AI orchestration underneath — and I explain the hard parts without the jargon.',
    hero_cta_hire: 'Hire me',
    hero_cta_cv: 'Download CV',
    hero_scroll: 'Scroll',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'ABOUT',
    about_h2: 'Here’s how I work.',
    about_p1:
      'I’m Alexis, a lead full-stack developer with 5+ years building web products from start to finish. What I’m best at is taking a messy, half-defined problem and owning it end to end — scoping it, building it, and shipping it to production.',
    about_p2:
      'These last couple of years I’ve gone deep into AI, but I’m comfortable across the whole stack (React, Next.js, Node, Python). A new tool or language shows up? I pick it up fast — honestly, that’s the part I enjoy most.',
    about_p3:
      'Right now I lead the frontend at anai, an AI content-generation SaaS. I work remotely and care about the person on the other side of the screen as much as the code. I ship fast, I sweat the details, and I keep teams moving.',
    stat_years: 'Years shipping to production',
    stat_projects: 'Products in production',
    stat_tech: 'Units monitored at iMometrics',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'THE STACK',
    skills_h2: 'The tools I work with.',
    skills_sub:
      'I know my own tools well, and I pick up whatever a project needs — fast.',
    skills_ai_title: 'AI Agents & Automation',
    skills_ai_desc:
      'I build AI that holds up in production — agents and pipelines that real users depend on every day.',
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
    svc1_title: 'AI Agents & Automation',
    svc1_desc:
      'Bots and automations that handle the boring, repetitive work for you — on WhatsApp, Telegram, or wherever your people already are.',
    svc2_title: 'Full-Stack Development',
    svc2_desc:
      'Web apps from start to finish: quick to launch, solid underneath, and built to scale as your users grow.',
    svc3_title: 'AI Strategy & Consulting',
    svc3_desc:
      'Not sure where AI fits in your business? I’ll help you tell the useful part from the hype and ship what actually helps.',
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
    hero_status: 'FULL-STACK · INGENIERO IA · REMOTO · FREELANCE',
    hero_h1: 'Hola, soy Alexis.',
    hero_h1_accent: 'Llevo productos de la idea a producción.',
    hero_sub:
      'Lead full-stack developer especializado en IA. Diseño y construyo plataformas web de punta a punta — del frontend en Next.js a la orquestación de IA que va por debajo — y explico lo complejo sin tecnicismos.',
    hero_cta_hire: 'Contrátame',
    hero_cta_cv: 'Descargar CV',
    hero_scroll: 'Baja',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'SOBRE MÍ',
    about_h2: 'Te cuento cómo trabajo.',
    about_p1:
      'Soy Alexis, lead full-stack developer. Llevo 5+ años construyendo productos web de principio a fin. En lo que mejor me muevo es en tomar un problema desordenado y a medio definir, apropiármelo de punta a punta — definirlo, construirlo y llevarlo a producción.',
    about_p2:
      'Estos últimos años me metí de lleno en la IA, pero me muevo cómodo en todo el stack (React, Next.js, Node, Python). ¿Aparece una herramienta o un lenguaje nuevo? Lo aprendo rápido — y la verdad, esa es la parte que más disfruto.',
    about_p3:
      'Hoy lidero el frontend en anai, un SaaS de generación de contenido con IA. Trabajo remoto y me importa la persona del otro lado de la pantalla tanto como el código. Entrego rápido, cuido los detalles y mantengo al equipo avanzando.',
    stat_years: 'Años entregando a producción',
    stat_projects: 'Productos en producción',
    stat_tech: 'Unidades monitoreadas en iMometrics',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'EL STACK',
    skills_h2: 'Con esto trabajo.',
    skills_sub:
      'Conozco bien mis herramientas y aprendo rápido lo que el proyecto pida.',
    skills_ai_title: 'Agentes de IA y Automatización',
    skills_ai_desc:
      'Construyo IA que aguanta en producción — agentes y pipelines de los que usuarios reales dependen a diario.',
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
    svc1_title: 'Agentes de IA y Automatización',
    svc1_desc:
      'Bots y automatizaciones que hacen por ti el trabajo aburrido y repetitivo — en WhatsApp, Telegram o donde ya tengas a tu gente.',
    svc2_title: 'Desarrollo Full-Stack',
    svc2_desc:
      'Apps web de principio a fin: rápidas de lanzar, sólidas por debajo y construidas para escalar a medida que crecen tus usuarios.',
    svc3_title: 'Estrategia y Consultoría IA',
    svc3_desc:
      '¿No sabes por dónde meterle IA a tu negocio? Te ayudo a separar lo útil del humo y lanzar lo que de verdad suma.',
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
