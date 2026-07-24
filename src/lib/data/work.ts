import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/types';

// ── Generic bilingual wrapper ─────────────────────────────────────────────────
// Keeps both language translations adjacent so it is impossible to forget one.
// Use pick(localized, lang) to read the active-language value.
export type Localized<T> = Readonly<Record<Lang, T>>;

export function pick<T>(loc: Localized<T>, lang: Lang): T {
  return loc[lang];
}

// ── Status ────────────────────────────────────────────────────────────────────
export const WORK_STATUS = {
  LIVE: 'live',
  BACKEND: 'backend',
  ARCHIVED: 'archived',
} as const;

export type WorkStatusKey = (typeof WORK_STATUS)[keyof typeof WORK_STATUS];

// ── Links ─────────────────────────────────────────────────────────────────────
/**
 * GitHub profile overview — the fallback "Code" target.
 *
 * Several of these projects live in private repos, so linking straight at them
 * gives an anonymous visitor a 404. Those point here instead: the profile
 * overview, where the README presents the work. Same for a project whose
 * product domain has lapsed.
 */
export const GITHUB_OVERVIEW = 'https://github.com/AlexisPalacioDev';

export interface WorkLinks {
  /** "Open" — live demo or product URL. null when not public. */
  link: string | null;
  /** "Code" — GitHub / source URL. null when closed-source. */
  code: string | null;
}

// ── WorkItem ──────────────────────────────────────────────────────────────────
export interface WorkItem {
  /** Stable slug — used as deck key, dot key, and unit tests */
  id: string;
  /** Company / client name (proper noun — not localized) */
  company: string;
  /** Project name (proper noun — not localized) */
  name: string;
  /** Per-project accent hex — applied via inline style, NOT a theme token */
  accent: string;
  /** ESM-imported asset so Astro's Sharp pipeline optimizes it at build time */
  cover: ImageMetadata;
  links: WorkLinks;
  period: Localized<string>;
  role: Localized<string>;
  kind: Localized<string>;
  /** Human-readable status label (localized) */
  status: Localized<string>;
  /** Machine status key — drives styling/filtering */
  statusKey: WorkStatusKey;
  /** Short description paragraph */
  desc: Localized<string>;
  /** "What I did" bullet list */
  bullets: Localized<string[]>;
  /** Tech tags — not localized */
  tags: readonly string[];
}

// ── Cover images (ESM imports → Sharp-optimized at build time) ────────────────
import coverAnai from '../../assets/preview-anai.png';
import coverImometrics from '../../assets/preview-imometrics.png';
import coverSticker from '../../assets/preview-sticker.png';
import coverApptreeking from '../../assets/preview-apptreeking.png';
import coverCarljung from '../../assets/cover-carljung.png';
import coverBunny from '../../assets/preview-bunny.png';
import coverTodo from '../../assets/preview-todo.png';
import coverExtraction from '../../assets/preview-extraction-survivors.png';
import coverPoisonflix from '../../assets/preview-poisonflix.png';
import coverPoisonos from '../../assets/preview-poisonos.png';
import coverHermes from '../../assets/preview-hermes.png';

// ── Work array — most-recent first ───────────────────────────────────────────
export const work: readonly WorkItem[] = [
  // 0 — anai
  {
    id: 'anai',
    company: 'anai',
    name: 'anai',
    accent: '#5B8DEF',
    cover: coverAnai,
    links: { link: 'https://anaiapp.ai', code: null },
    period: { en: '2026 — Present', es: '2026 — Hoy' },
    role: {
      en: 'Lead Fullstack Developer · Frontend',
      es: 'Líder de Desarrollo Fullstack · Frontend',
    },
    kind: { en: 'AI Video Creation SaaS', es: 'SaaS de Creación de Video con IA' },
    status: { en: 'Current', es: 'Actual' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'I lead the Next.js 16 / React 19 platform at anai (anaiapp.ai) — an AI SaaS that turns social content into viral short-form videos through AI scripting, voice synthesis and a browser-native video editor. Leading the engineering team, serving thousands of users with billing handled through Hotmart.',
      es: 'Lidero la plataforma Next.js 16 / React 19 de anai (anaiapp.ai) — un SaaS de IA que convierte contenido social en videos cortos virales mediante scripting con IA, síntesis de voz y un editor de video nativo en el browser. Lidero el equipo de desarrollo, con miles de usuarios y cobros gestionados a través de Hotmart.',
    },
    bullets: {
      en: [
        'Lead the Next.js 16 / React 19 frontend and the BFF architecture (Route Handlers → NestJS, Google OAuth, HttpOnly cookies) — leading the engineering team and coordinating sprint delivery',
        'Built a browser-native video editor with WebCodecs, WebGL and WASM subtitle rendering',
        'Integrated Claude, GPT, Gemini, Veo 3.1 and ElevenLabs into an AI-assisted creation studio',
      ],
      es: [
        'Lidero el frontend Next.js 16 / React 19 y la arquitectura BFF (Route Handlers → NestJS, Google OAuth, cookies HttpOnly) — liderando el equipo de desarrollo y coordinando la entrega de sprints',
        'Construí un editor de video nativo en el browser con WebCodecs, WebGL y renderizado de subtítulos por WASM',
        'Integré Claude, GPT, Gemini, Veo 3.1 y ElevenLabs en un estudio de creación asistido por IA',
      ],
    },
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'NestJS', 'Google Cloud', 'Claude / Veo 3.1'],
  },

  // 1 — Extraction Survivors
  {
    id: 'extraction-survivors',
    company: 'Personal Project',
    name: 'Extraction Survivors',
    accent: '#3B6EF0',
    cover: coverExtraction,
    links: { link: 'https://extraction-survivors-client.vercel.app', code: null },
    period: { en: '2026', es: '2026' },
    role: {
      en: 'Game Developer · Solo',
      es: 'Game Developer · Solo',
    },
    kind: { en: '2D Multiplayer Survivors Game', es: 'Juego Survivors Multijugador 2D' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'A 2D browser multiplayer extraction-looter with Vampire-Survivors-style hordes — up to 4 players over WebRTC. Built from scratch with no game engine: a custom ECS and fixed-timestep simulation, PixiJS (WebGL) only for rendering, and procedural pixel creatures (a descendant of this portfolio’s Bug Hunt fly).',
      es: 'Looter-extraction multijugador 2D en el browser con hordas estilo Vampire Survivors — hasta 4 jugadores por WebRTC. Hecho desde cero, sin motor de juego: ECS y simulación de timestep fijo propios, PixiJS (WebGL) solo para el render, y criaturas pixel procedurales (descendientes de la mosca del Bug Hunt de este portafolio).',
    },
    bullets: {
      en: [
        'Designed the simulation core from scratch with no game engine — fixed-timestep loop, ECS, spatial-grid collisions — so it runs identically on host and clients',
        'Built host-client netcode over WebRTC DataChannels (+ a signaling server) with snapshot streaming and interpolation for up to 4 players',
        'Rendered hundreds of enemies on the GPU with PixiJS by rasterizing procedural pixel creatures to cached textures',
        'Shipped a full loop: Vampire-Survivors auto-combat, ground loot, hold-to-extract zones, death-drops and between-run meta-progression',
      ],
      es: [
        'Diseñé el core de simulación desde cero, sin motor de juego — loop de timestep fijo, ECS, colisiones por grilla espacial — para que corra igual en host y clientes',
        'Construí el netcode host-cliente sobre WebRTC DataChannels (+ servidor de signaling) con streaming de snapshots e interpolación para hasta 4 jugadores',
        'Rendericé cientos de enemigos en la GPU con PixiJS rasterizando criaturas pixel procedurales a texturas cacheadas',
        'Entregué el loop completo: auto-combate estilo Vampire Survivors, loot, zonas de extracción (mantener para extraer), drop al morir y meta-progresión entre partidas',
      ],
    },
    tags: ['TypeScript', 'PixiJS / WebGL', 'WebRTC', 'ECS', 'Vite', 'Monorepo'],
  },

  // 1 — iMometrics
  {
    id: 'imometrics',
    company: 'iMometrics',
    name: 'iMometrics',
    accent: '#8B7CF6',
    cover: coverImometrics,
    links: { link: 'https://www.imometrics.com', code: null },
    period: { en: '2024 — 2026', es: '2024 — 2026' },
    role: {
      en: 'Backend Developer',
      es: 'Desarrollador Backend',
    },
    kind: { en: 'Cold-Chain Monitoring Platform', es: 'Plataforma de Monitoreo de Cadena de Frío' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'Backend architecture and real-time alerting system for iMometrics, a cold-chain monitoring platform that processes sensor data from refrigeration fleets of 1 to 1,000+ units — delivering real-time metrics, dashboards and audible alerts.',
      es: 'Arquitectura backend y sistema de alertamiento en tiempo real para iMometrics, plataforma de monitoreo de cadena de frío que procesa datos de sensores de flotas de refrigeración de 1 a 1,000+ equipos — entregando métricas, dashboards y alertas sonoras en tiempo real.',
    },
    bullets: {
      en: [
        'Built a real-time audio alerting system ("sound alarm") that notifies users when temperature measurements deviate from parameters — eliminating the need for constant dashboard monitoring and reducing response time on critical refrigeration assets',
        'Designed a device control panel for diagnosing sensors that stop reporting data, enabling companies to trace failure root causes, view historical logs and generate automatic support tickets — improving incident traceability across 1,000+ device fleets',
        'Optimized SQL queries and implemented Redis caching, reducing average API response time by 60%',
        'Built data ingestion pipelines and aggregation logic processing sensor temperature readings at scale',
      ],
      es: [
        'Construí un sistema de alertamiento sonoro en tiempo real que notifica a los usuarios cuando las mediciones de temperatura se salen de los parámetros — eliminando la necesidad de monitoreo constante del dashboard y reduciendo el tiempo de respuesta en equipos críticos de refrigeración',
        'Diseñé un panel de control de equipos para diagnosticar sensores que dejan de reportar datos, permitiendo a las empresas rastrear causas raíz de fallos, ver históricos y generar tickets de soporte automáticos — mejorando la trazabilidad de incidencias en flotas de 1,000+ equipos',
        'Optimicé consultas SQL e implementé caché con Redis, reduciendo el tiempo de respuesta promedio de las APIs en un 60%',
        'Construí pipelines de ingesta de datos y lógica de agregación procesando lecturas de sensores de temperatura a escala',
      ],
    },
    tags: ['PHP', 'CakePHP', 'MySQL', 'Redis', 'Docker', 'AWS'],
  },

  // 2 — Sticker Drops
  {
    id: 'sticker-drops',
    company: 'Sticker Drops',
    name: 'Sticker Drops',
    accent: '#FF5CA8',
    cover: coverSticker,
    links: { link: 'https://sticker-drops.vercel.app', code: null },
    period: { en: '2023', es: '2023' },
    role: {
      en: 'Full-Stack Developer',
      es: 'Desarrollador Full-Stack',
    },
    kind: { en: 'Collectible Drops Platform', es: 'Plataforma de Drops Coleccionables' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'A collectible "drops" platform — limited runs of numbered tickets where users pick a number to win prizes, with a Next.js 16 storefront, Supabase backend and fal.ai-generated artwork.',
      es: 'Plataforma de "drops" coleccionables — tiradas limitadas de talonarios numerados donde el usuario elige su número para ganar premios, con storefront Next.js 16, backend Supabase y arte generado con fal.ai.',
    },
    bullets: {
      en: [
        'Built the Next.js 16 storefront with live drops, numbered ticket selection and pricing',
        'Backed it with Supabase for data, auth and real-time drop availability',
        'Integrated fal.ai to generate the drop artwork',
      ],
      es: [
        'Construí el storefront Next.js 16 con drops en vivo, selección de talonario numerado y precios',
        'Lo respaldé con Supabase para datos, auth y disponibilidad de drops en tiempo real',
        'Integré fal.ai para generar el arte de los drops',
      ],
    },
    tags: ['Next.js 16', 'TypeScript', 'Supabase', 'fal.ai', 'Tailwind'],
  },

  // 3 — Tripi
  {
    id: 'apptreeking',
    company: 'AppTreeking',
    name: 'AppTreeking',
    accent: '#46C97E',
    cover: coverApptreeking,
    // Repo is private — a direct link 404s for visitors. Point at the profile.
    links: { link: null, code: GITHUB_OVERVIEW },
    period: { en: '2025 — 2026', es: '2025 — 2026' },
    role: {
      en: 'Full-Stack Mobile Developer',
      es: 'Desarrollador Full-Stack Mobile',
    },
    kind: { en: 'Trekking Experiences Marketplace', es: 'Marketplace de Experiencias de Trekking' },
    status: { en: 'In progress', es: 'En curso' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'A mobile marketplace connecting Colombian travelers with certified local trekking guides — guides publish routes by biome; travelers book spots with escrow-protected payments via Wompi. Built solo: mobile app, Supabase backend and a Next.js admin panel.',
      es: 'Marketplace móvil que conecta viajeros colombianos con guías de trekking locales certificados — los guías publican rutas por bioma; los viajeros reservan cupos con pago en custodia vía Wompi. Hecho en solitario: app móvil, backend Supabase y panel admin Next.js.',
    },
    bullets: {
      en: [
        'Built a full-stack Expo / React Native marketplace on Supabase — RLS policies, Postgres RPCs and Deno Edge Functions for escrow booking and payment webhooks',
        'Integrated Wompi (Colombia) behind a port/adapter pattern with webhook signature verification and checkout integrity signing',
        'Designed a role-based system (traveler / guide / admin) with a guide-verification flow and a Next.js admin panel for moderation and disputes',
      ],
      es: [
        'Construí un marketplace full-stack Expo / React Native sobre Supabase — políticas RLS, RPCs de Postgres y Deno Edge Functions para reservas en custodia y webhooks de pago',
        'Integré Wompi (Colombia) con patrón port/adapter, verificación de firma de webhooks y firma de integridad del checkout',
        'Diseñé un sistema por roles (viajero / guía / admin) con flujo de verificación de guías y un panel admin Next.js para moderación y disputas',
      ],
    },
    tags: ['Expo / React Native', 'TypeScript', 'Supabase', 'Wompi', 'Next.js'],
  },

  // 4 — Carl Jung AI
  {
    id: 'carljung',
    company: 'Carl Jung AI',
    name: 'Carl Jung AI',
    accent: '#C6F24E',
    cover: coverCarljung,
    // carljung.app no longer resolves (domain lapsed) — the "Open" button was a
    // dead end. Until it's back up, send visitors to the profile instead.
    links: { link: null, code: GITHUB_OVERVIEW },
    period: { en: '2023', es: '2023' },
    role: {
      en: 'AI Engineer & Full-Stack Developer',
      es: 'Ingeniero IA & Desarrollador Full-Stack',
    },
    kind: { en: 'Educational Platform with AI', es: 'Plataforma Educativa con IA' },
    status: { en: 'Archived', es: 'Archivado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'An AI-powered educational platform with 10,000+ registered users that generates formative content based on Carl Jung\'s archetypes. Built from scratch with Next.js/React frontend, Supabase backend and real subscription billing and payment processing.',
      es: 'Plataforma educativa con IA con 10,000+ usuarios registrados que genera contenido formativo basado en los arquetipos de Carl Jung. Construida desde cero con frontend Next.js/React, backend Supabase y procesamiento de pagos y suscripciones reales.',
    },
    bullets: {
      en: [
        'Architected and built the full Next.js/React frontend with server-side rendering, auth flows and responsive design serving 10,000+ users',
        'Implemented real subscription billing — webhooks, subscription management and full payment lifecycle handling',
        'Built an AI content generation pipeline using ChatGPT API with structured prompting and RAG over primary Jungian texts for philosophical accuracy',
        'Designed Supabase database schema, Row Level Security policies and real-time features for user content delivery',
      ],
      es: [
        'Arquitecté y construí el frontend completo en Next.js/React con renderizado server-side, flujos de autenticación y diseño responsivo sirviendo a 10,000+ usuarios',
        'Implementé cobros y suscripciones reales — webhooks, gestión de suscripciones y manejo completo del ciclo de vida de pagos',
        'Construí un pipeline de generación de contenido con IA usando ChatGPT API con prompting estructurado y RAG sobre textos jungianos primarios para precisión filosófica',
        'Diseñé el esquema de base de datos en Supabase, políticas de seguridad Row Level Security y funcionalidades en tiempo real para entrega de contenido',
      ],
    },
    tags: ['Next.js', 'React', 'Supabase', 'ChatGPT API', 'RAG'],
  },

  // 5 — BunnyGymWear
  {
    id: 'bunnygymwear',
    company: 'BunnyGymWear',
    name: 'BunnyGymWear',
    accent: '#F5C24B',
    cover: coverBunny,
    links: { link: 'https://bunnygymwear.com', code: null },
    period: { en: '2022', es: '2022' },
    role: {
      en: 'Full-Stack Developer',
      es: 'Desarrollador Full-Stack',
    },
    kind: { en: 'E-commerce / Fashion Brand', es: 'E-commerce / Marca de Moda' },
    status: { en: 'Delivered', es: 'Entregado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'Complete e-commerce platform for BunnyGymWear, a fitness and activewear brand — from product catalog to checkout, inventory management and order tracking.',
      es: 'Plataforma de e-commerce completa para BunnyGymWear, una marca de ropa fitness y activewear — desde catálogo de productos hasta checkout, gestión de inventario y seguimiento de pedidos.',
    },
    bullets: {
      en: [
        'Built full e-commerce platform with product catalog, cart, checkout and order management',
        'Integrated payment gateway supporting local Colombian payment methods',
        'Implemented inventory management system with low-stock alerts and replenishment flows',
        'Designed brand-consistent UI matching the energetic fitness aesthetic',
      ],
      es: [
        'Construí plataforma e-commerce completa con catálogo, carrito, checkout y gestión de pedidos',
        'Integré pasarela de pago soportando métodos de pago locales colombianos',
        'Implementé sistema de gestión de inventario con alertas de stock bajo y flujos de reposición',
        'Diseñé UI coherente con la marca, acorde a la estética fitness energética',
      ],
    },
    tags: ['Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
  },

  // 6 — To-Do Automation
  {
    id: 'todo-automation',
    company: 'Personal Project',
    name: 'To-Do Automation',
    accent: '#3DD6C0',
    cover: coverTodo,
    // The code link pointed at the bare profile; this repo is public, so link it.
    links: {
      link: 'https://todo-automation-challenge.vercel.app',
      code: 'https://github.com/AlexisPalacioDev/todo-automation-challenge',
    },
    period: { en: '2023', es: '2023' },
    role: {
      en: 'AI Engineer & Developer',
      es: 'Ingeniero IA & Desarrollador',
    },
    kind: { en: 'AI Automation / n8n Harness', es: 'Automatización IA / Harness n8n' },
    status: { en: 'Open Source', es: 'Open Source' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'An intelligent task automation harness that connects to-do lists with AI agents — tasks are parsed, prioritized and delegated to specialized sub-agents that research, draft and execute actions autonomously.',
      es: 'Harness de automatización de tareas inteligente que conecta listas de tareas con agentes IA — las tareas se analizan, priorizan y delegan a sub-agentes especializados que investigan, redactan y ejecutan acciones de forma autónoma.',
    },
    bullets: {
      en: [
        'Built n8n automation harness with AI-powered task parsing and intent classification',
        'Implemented multi-agent routing: research agent, drafting agent and execution agent',
        'Integrated with Notion, Google Calendar and Slack for full workflow coverage',
        'Added LLM-based priority scoring and deadline detection from natural language',
      ],
      es: [
        'Construí harness de automatización n8n con análisis de tareas impulsado por IA y clasificación de intenciones',
        'Implementé ruteo multi-agente: agente de investigación, agente de redacción y agente de ejecución',
        'Integré con Notion, Google Calendar y Slack para cobertura completa del flujo de trabajo',
        'Agregué puntuación de prioridad basada en LLM y detección de plazos desde lenguaje natural',
      ],
    },
    tags: ['n8n', 'OpenAI', 'Notion API', 'Slack', 'Node.js'],
  },

  // 7 — PoisonFlix
  {
    id: 'poisonflix',
    company: 'Personal Project',
    name: 'PoisonFlix',
    accent: '#E50914',
    cover: coverPoisonflix,
    // Repo is private — a direct link 404s for visitors. Point at the profile.
    links: { link: null, code: GITHUB_OVERVIEW },
    period: { en: '2025', es: '2025' },
    role: {
      en: 'Full-Stack Developer & DevOps',
      es: 'Desarrollador Full-Stack & DevOps',
    },
    kind: { en: 'Netflix-like Streaming PWA', es: 'PWA Streaming tipo Netflix' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'A Netflix-like streaming PWA built on top of Jellyfin, transforming a media server into a polished streaming experience with a modern interface, search, organized catalog, automated content fetching and cross-platform playback.',
      es: 'PWA de streaming tipo Netflix construida sobre Jellyfin, transformando un servidor de medios en una experiencia de streaming completa con interfaz moderna, búsqueda, catálogo organizado, automatización de contenido y reproducción multiplataforma.',
    },
    bullets: {
      en: [
        'Built a full-featured PWA from scratch — same-origin architecture, responsive design and offline capabilities via service workers',
        'Integrated Jellyfin API for media catalog, search, playback and user management across devices',
        'Automated content pipeline with Sonarr/Radarr integration — new media is fetched, organized and available for streaming without manual intervention',
        'Containerized the full stack (Jellyfin, Sonarr, Radarr, Prowlarr, qBittorrent) with Docker Compose for one-command deployment',
      ],
      es: [
        'Construí una PWA completa desde cero — arquitectura same-origin, diseño responsivo y capacidades offline via service workers',
        'Integré la API de Jellyfin para catálogo de medios, búsqueda, reproducción y gestión de usuarios multi-dispositivo',
        'Automaticé el pipeline de contenido con integración de Sonarr/Radarr — el contenido nuevo se descarga, organiza y está disponible para streaming sin intervención manual',
        'Contenericé el stack completo (Jellyfin, Sonarr, Radarr, Prowlarr, qBittorrent) con Docker Compose para despliegue con un solo comando',
      ],
    },
    tags: ['TypeScript', 'PWA', 'Jellyfin API', 'Docker', 'Sonarr/Radarr', 'Linux'],
  },

  // 8 — PoisonOS
  {
    id: 'poisonos',
    company: 'Personal Project',
    name: 'PoisonOS',
    accent: '#00D4AA',
    cover: coverPoisonos,
    // Repo is private — a direct link 404s for visitors. Point at the profile.
    links: { link: null, code: GITHUB_OVERVIEW },
    period: { en: '2025', es: '2025' },
    role: {
      en: 'Android Developer & Systems Engineer',
      es: 'Desarrollador Android & Ingeniero de Sistemas',
    },
    kind: { en: 'Custom Android Launcher for Projector', es: 'Launcher Android Custom para Proyector' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'A custom minimalist Android launcher (PoisonOS) + tooling for the HY300 Ultra projector — replacing the factory software with a clean, optimized interface, without requiring root access.',
      es: 'Launcher Android minimalista custom (PoisonOS) + tooling para el proyector HY300 Ultra — reemplazando el software de fábrica con una interfaz limpia y optimizada, sin necesidad de root.',
    },
    bullets: {
      en: [
        'Designed and built a custom Android launcher from scratch — minimal UI, fast navigation, optimized for projector remote input',
        'Developed tooling for no-root deployment via ADB — sideloading, permissions management and automated updates',
        'Overcame factory software limitations (bloated UI, slow navigation, no customization) delivering a clean media-centric experience',
        'Created comprehensive documentation and installation scripts for the open-source community',
      ],
      es: [
        'Diseñé y construí un launcher Android custom desde cero — UI minimalista, navegación rápida, optimizado para entrada por control remoto del proyector',
        'Desarrollé tooling para despliegue sin root via ADB — sideloading, gestión de permisos y actualizaciones automáticas',
        'Superé las limitaciones del software de fábrica (UI pesada, navegación lenta, sin personalización) entregando una experiencia limpia centrada en medios',
        'Creé documentación completa y scripts de instalación para la comunidad open-source',
      ],
    },
    tags: ['Android', 'Kotlin', 'ADB', 'Launcher Custom', 'Open Source', 'Linux'],
  },

  // 9 — Mendez AI Server
  {
    id: 'mendez-ai',
    company: 'Personal Project',
    name: 'Mendez AI Server',
    accent: '#8B5CF6',
    cover: coverHermes,
    links: { link: null, code: null },
    period: { en: '2025 — Present', es: '2025 — Presente' },
    role: {
      en: 'AI Engineer & Systems Architect',
      es: 'Ingeniero IA & Arquitecto de Sistemas',
    },
    kind: { en: 'Autonomous AI Agent Server', es: 'Servidor Autónomo de Agentes IA' },
    status: { en: 'Live', es: 'En vivo' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'An autonomous AI agent server (Hermes Agent) deployed on bare-metal Linux that executes code, browses the web, manipulates files and orchestrates complex workflows via Telegram — with speech-to-text voice interface and multi-provider AI integration.',
      es: 'Servidor autónomo de agentes de IA (Hermes Agent) desplegado en bare-metal Linux que ejecuta código, navega la web, manipula archivos y orquesta flujos de trabajo complejos vía Telegram — con interfaz de voz speech-to-text e integración multi-provider de IA.',
    },
    bullets: {
      en: [
        'Architected and deployed a full-agent infrastructure on bare-metal Linux — multiple AI providers (OpenRouter, Anthropic), tool-calling execution environment and Telegram gateway',
        'Built a voice interface pipeline — speech-to-text transcription, AI processing and text-to-speech response in Latin American Spanish',
        'Implemented autonomous capabilities: code execution, web browsing, file system operations, and sub-agent delegation for parallel task execution',
        'Configured systemd services, Docker containers and cron jobs for 24/7 production-grade autonomous operation',
      ],
      es: [
        'Arquitecté y desplegué infraestructura completa de agentes en bare-metal Linux — múltiples proveedores de IA (OpenRouter, Anthropic), entorno de ejecución con tool-calling y gateway de Telegram',
        'Construí un pipeline de interfaz de voz — transcripción speech-to-text, procesamiento con IA y respuesta text-to-speech en español latino',
        'Implementé capacidades autónomas: ejecución de código, navegación web, operaciones de sistema de archivos y delegación de sub-agentes para ejecución paralela de tareas',
        'Configuré servicios systemd, contenedores Docker y cron jobs para operación autónoma 24/7 a nivel producción',
      ],
    },
    tags: ['Python', 'Linux', 'Docker', 'APIs IA', 'Telegram Bot', 'STT/TTS', 'systemd'],
  },
] as const;
