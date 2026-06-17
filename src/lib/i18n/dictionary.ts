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
    hero_status: 'FULL-STACK · AI ENGINEER · REMOTE · FREELANCE',
    hero_h1: 'Give me the hard problem.',
    hero_h1_accent: 'I hand it back working.',
    hero_sub:
      'Full-stack developer who actually ships. Give me a half-baked idea and I figure it out, build it, and explain every step in plain words — no jargon, no hand-holding. Web apps, AI, automation: whatever it takes, I learn it fast and own it to the finish line.',
    hero_cta_hire: 'Hire me',
    hero_cta_cv: 'Download CV',
    hero_scroll: 'Scroll',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'ABOUT',
    about_h2: 'The developer you don’t have to babysit.',
    about_p1:
      'I’m a full-stack developer with 5+ years building real products — but my real edge isn’t a language or a framework. It’s that I don’t get stuck. Hand me a fuzzy, half-defined problem and I come back with something working, plus a clear explanation of how it works.',
    about_p2:
      'I move fast across the whole stack (React, Next.js, Node, Python) and over the last couple of years I’ve gone deep into AI. New tool, new domain, weird legacy codebase? I pick it up quickly and run with it — honestly, that’s the part I enjoy most.',
    about_p3:
      'Right now I’m building AI-powered content generation at anai. I work remote, I step up to lead when something needs leading, and I care about the people on the other side of the screen as much as the code. Hungry — in every sense of the word.',
    stat_years: 'Years shipping',
    stat_projects: 'Projects delivered',
    stat_tech: 'Any stack, fast',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'THE STACK',
    skills_h2: 'It’s not the tools. It’s what I do with them.',
    skills_sub:
      'Deep where it matters, broad enough to connect the dots — and quick to pick up whatever’s missing.',
    skills_ai_title: 'AI Agents & Automation',
    skills_ai_desc:
      'I build AI that actually gets the job done in the real world — not slick demos that fall apart the moment a real user shows up.',
    skills_core: 'Core focus',
    skills_loop: 'A typical agent loop',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra & Tools',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'SELECTED WORK',
    projects_h2: 'Stuff I actually shipped.',
    projects_sub:
      'Real products with real users — from marketplaces to AI content engines. No tutorials, no toys.',
    projects_view: 'Open',
    projects_code: 'Code',
    work_earlier: 'Earlier — Frontend Developer @ K Gumi & Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'Hire me for the part nobody wants to touch.',
    services_sub:
      'Freelance full-stack developer for hire — fully remote, full-time or by project. You bring the problem; I bring a working solution and straight talk the whole way. Let’s build.',
    svc1_title: 'AI Agents & Automation',
    svc1_desc:
      'Bots and automations that quietly handle the boring, repetitive work for you — on WhatsApp, Telegram, or wherever your people already are.',
    svc2_title: 'Full-Stack Development',
    svc2_desc:
      'Web apps from zero to live — fast to launch, solid under the hood, and built so they don’t crack the moment you start growing.',
    svc3_title: 'AI Strategy & Consulting',
    svc3_desc:
      'Not sure where AI actually fits your business? I help you skip the hype and ship the parts that genuinely move the needle.',
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
    contact_h2: 'Let’s build something.',
    contact_sub:
      'Open to remote roles, contracts and consulting — anywhere in the world. Tell me what you need in plain words; I usually reply the same day.',
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
    hero_status: 'FULL-STACK · INGENIERO IA · REMOTO · FREELANCE',
    hero_h1: 'Dame el problema difícil.',
    hero_h1_accent: 'te lo devuelvo funcionando.',
    hero_sub:
      'Desarrollador full-stack que de verdad entrega. Dame una idea a medio cocinar y la resuelvo, la construyo y te explico cada paso en palabras simples — sin jerga y sin que tengas que estar encima. Apps web, IA, automatización: lo que haga falta, lo aprendo rápido y lo llevo hasta el final.',
    hero_cta_hire: 'Contrátame',
    hero_cta_cv: 'Descargar CV',
    hero_scroll: 'Baja',
    hero_loc: 'Medellín, Colombia · GMT-5',

    // ── About ─────────────────────────────────────────────────────────────
    about_label: 'SOBRE MÍ',
    about_h2: 'El desarrollador que no tienes que estar vigilando.',
    about_p1:
      'Soy desarrollador full-stack con 5+ años construyendo productos reales — pero mi verdadero fuerte no es un lenguaje ni un framework. Es que no me trabo. Dame un problema difuso, a medio definir, y vuelvo con algo funcionando y una explicación clara de cómo funciona.',
    about_p2:
      'Me muevo rápido en todo el stack (React, Next.js, Node, Python) y en los últimos años me metí de lleno en la IA. ¿Herramienta nueva, dominio nuevo, código heredado raro? Lo agarro rápido y lo saco adelante — la verdad, esa es la parte que más disfruto.',
    about_p3:
      'Hoy construyo generación de contenido con IA en anai. Trabajo remoto, doy un paso al frente para liderar cuando algo lo necesita, y me importan tanto las personas del otro lado de la pantalla como el código. Con hambre — en todos los sentidos de la palabra.',
    stat_years: 'Años entregando',
    stat_projects: 'Proyectos entregados',
    stat_tech: 'Cualquier stack, rápido',

    // ── Stack (Skills) ────────────────────────────────────────────────────
    skills_label: 'EL STACK',
    skills_h2: 'No son las herramientas. Es lo que hago con ellas.',
    skills_sub:
      'Profundidad donde importa, amplitud para conectar los puntos — y rapidez para aprender lo que falte.',
    skills_ai_title: 'Agentes de IA y Automatización',
    skills_ai_desc:
      'Construyo IA que de verdad resuelve en el mundo real — no demos vistosas que se caen apenas aparece un usuario de carne y hueso.',
    skills_core: 'Foco principal',
    skills_loop: 'Un loop de agente típico',
    cat_backend: 'Backend',
    cat_frontend: 'Frontend',
    cat_infra: 'Infra y Herramientas',

    // ── Work & Projects ───────────────────────────────────────────────────
    projects_label: 'TRABAJO SELECCIONADO',
    projects_h2: 'Cosas que de verdad entregué.',
    projects_sub:
      'Productos reales, con usuarios reales — desde marketplaces hasta motores de contenido con IA. Nada de tutoriales ni juguetes.',
    projects_view: 'Abrir',
    projects_code: 'Código',
    work_earlier: 'Antes — Frontend Developer en K Gumi y Wiptool (2020–2024)',

    // ── Services ──────────────────────────────────────────────────────────
    services_label: 'FREELANCE',
    services_h2: 'Contrátame para la parte que nadie quiere tocar.',
    services_sub:
      'Desarrollador full-stack freelance disponible — 100% remoto, full-time o por proyecto. Tú traes el problema; yo traigo una solución que funciona y te hablo claro en todo el camino. Construyamos.',
    svc1_title: 'Agentes de IA y Automatización',
    svc1_desc:
      'Bots y automatizaciones que hacen por ti, sin ruido, el trabajo aburrido y repetitivo — en WhatsApp, Telegram o donde ya está tu gente.',
    svc2_title: 'Desarrollo Full-Stack',
    svc2_desc:
      'Apps web de cero a producción — rápidas de lanzar, sólidas por dentro y hechas para que no se rompan cuando empieces a crecer.',
    svc3_title: 'Estrategia y Consultoría IA',
    svc3_desc:
      '¿No sabes dónde encaja la IA en tu negocio? Te ayudo a saltarte el humo y lanzar lo que de verdad mueve la aguja.',
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
    contact_h2: 'Construyamos algo.',
    contact_sub:
      'Abierto a roles remotos, contratos y consultoría — en cualquier parte del mundo. Cuéntame qué necesitas en palabras simples; suelo responder el mismo día.',
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
