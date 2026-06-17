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
import coverImometrics from '../../assets/cover-imometrics.png';
import coverSticker from '../../assets/preview-sticker.png';
import coverTripi from '../../assets/cover-tripi.png';
import coverCarljung from '../../assets/cover-carljung.png';
import coverBunny from '../../assets/cover-bunny.png';
import coverTodo from '../../assets/cover-todo.png';

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
    period: { en: '2024 — Present', es: '2024 — Hoy' },
    role: {
      en: 'Lead Fullstack Developer · Frontend',
      es: 'Líder de Desarrollo Fullstack · Frontend',
    },
    kind: { en: 'AI Video Creation SaaS', es: 'SaaS de Creación de Video con IA' },
    status: { en: 'Current', es: 'Actual' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'I lead the Next.js 16 / React 19 platform at anai (anaiapp.ai) — an AI SaaS that turns social content into viral short-form videos through AI scripting, voice synthesis and a browser-native video editor.',
      es: 'Lidero la plataforma Next.js 16 / React 19 de anai (anaiapp.ai) — un SaaS de IA que convierte contenido social en videos cortos virales mediante scripting con IA, síntesis de voz y un editor de video nativo en el browser.',
    },
    bullets: {
      en: [
        'Lead the Next.js 16 / React 19 frontend and the BFF architecture (Route Handlers → NestJS, Google OAuth, HttpOnly cookies)',
        'Built a browser-native video editor with WebCodecs, WebGL and WASM subtitle rendering',
        'Integrated Claude, GPT, Gemini, Veo 3.1 and ElevenLabs into an AI-assisted creation studio',
      ],
      es: [
        'Lidero el frontend Next.js 16 / React 19 y la arquitectura BFF (Route Handlers → NestJS, Google OAuth, cookies HttpOnly)',
        'Construí un editor de video nativo en el browser con WebCodecs, WebGL y renderizado de subtítulos por WASM',
        'Integré Claude, GPT, Gemini, Veo 3.1 y ElevenLabs en un estudio de creación asistido por IA',
      ],
    },
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'NestJS', 'Google Cloud', 'Claude / Veo 3.1'],
  },

  // 1 — iMometrics
  {
    id: 'imometrics',
    company: 'iMometrics',
    name: 'iMometrics',
    accent: '#8B7CF6',
    cover: coverImometrics,
    links: { link: null, code: null },
    period: { en: '2023 — 2024', es: '2023 — 2024' },
    role: {
      en: 'Backend Developer',
      es: 'Desarrollador Backend',
    },
    kind: { en: 'Analytics & Metrics Platform', es: 'Plataforma de Analítica y Métricas' },
    status: { en: 'Delivered', es: 'Entregado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'Backend architecture and API development for a B2B analytics platform delivering real-time metrics and reporting dashboards to enterprise clients.',
      es: 'Arquitectura backend y desarrollo de APIs para una plataforma de analítica B2B que entrega métricas en tiempo real y dashboards de reportes a clientes enterprise.',
    },
    bullets: {
      en: [
        'Designed and built RESTful APIs with Node.js / PHP serving hundreds of concurrent clients',
        'Implemented data ingestion pipelines and aggregation logic for real-time dashboards',
        'Optimized database queries reducing average response time by 60%',
        'Delivered comprehensive API documentation and integration guides for enterprise partners',
      ],
      es: [
        'Diseñé y construí APIs RESTful con Node.js / PHP sirviendo cientos de clientes concurrentes',
        'Implementé pipelines de ingesta de datos y lógica de agregación para dashboards en tiempo real',
        'Optimicé consultas de base de datos reduciendo el tiempo de respuesta promedio en un 60%',
        'Entregué documentación de API completa y guías de integración para partners enterprise',
      ],
    },
    tags: ['Node.js', 'PHP', 'MySQL', 'Redis', 'AWS'],
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
    id: 'tripi',
    company: 'Tripi',
    name: 'Tripi',
    accent: '#46C97E',
    cover: coverTripi,
    links: { link: null, code: null },
    period: { en: '2022 — 2023', es: '2022 — 2023' },
    role: {
      en: 'Full-Stack Developer',
      es: 'Desarrollador Full-Stack',
    },
    kind: { en: 'Marketplace with Escrow', es: 'Marketplace con Escrow' },
    status: { en: 'Delivered', es: 'Entregado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'Full-stack development of Tripi, an app-based treeking and adventure activities marketplace with integrated escrow payments, provider management and booking flows.',
      es: 'Desarrollo full-stack de Tripi, un marketplace de actividades de trekking y aventura con pagos escrow integrados, gestión de proveedores y flujos de reserva.',
    },
    bullets: {
      en: [
        'Built end-to-end marketplace with escrow payment system protecting both buyers and providers',
        'Designed provider onboarding flow and activity listing management system',
        'Implemented booking, scheduling and review system with real-time notifications',
        'Delivered responsive web app and integration with payment provider for Colombia market',
      ],
      es: [
        'Construí marketplace completo con sistema de pagos escrow que protege compradores y proveedores',
        'Diseñé flujo de onboarding de proveedores y sistema de gestión de listados de actividades',
        'Implementé sistema de reservas, agenda y reseñas con notificaciones en tiempo real',
        'Entregué app web responsive con integración a proveedor de pagos para el mercado colombiano',
      ],
    },
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'TypeScript'],
  },

  // 4 — Carl Jung AI
  {
    id: 'carljung',
    company: 'Carl Jung AI',
    name: 'Carl Jung AI',
    accent: '#C6F24E',
    cover: coverCarljung,
    links: { link: null, code: null },
    period: { en: '2023', es: '2023' },
    role: {
      en: 'AI Engineer & Developer',
      es: 'Ingeniero IA & Desarrollador',
    },
    kind: { en: 'AI Persona / Chatbot', es: 'Persona IA / Chatbot' },
    status: { en: 'Archived', es: 'Archivado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'An AI-powered persona chatbot channeling the personality, writings and philosophy of Carl Jung — built with fine-tuned prompting, RAG over primary texts and a character-consistent response pipeline.',
      es: 'Chatbot con personalidad IA que encarna a Carl Jung — construido con prompting afinado, RAG sobre textos primarios y un pipeline de respuestas con coherencia de personaje.',
    },
    bullets: {
      en: [
        'Built RAG pipeline ingesting primary Jungian texts (archetypes, collective unconscious, shadow work)',
        'Designed character-consistent prompting with guardrails to maintain philosophical accuracy',
        'Implemented conversation memory and context window management for long sessions',
        'Deployed conversational interface accessible via web with session persistence',
      ],
      es: [
        'Construí pipeline RAG ingiriendo textos jungianos primarios (arquetipos, inconsciente colectivo, trabajo con la sombra)',
        'Diseñé prompting coherente con el personaje y guardrails para mantener precisión filosófica',
        'Implementé memoria de conversación y gestión de ventana de contexto para sesiones largas',
        'Desplegué interfaz conversacional accesible vía web con persistencia de sesión',
      ],
    },
    tags: ['OpenAI', 'RAG', 'LangChain', 'Python', 'pgvector'],
  },

  // 5 — BunnyGymWear
  {
    id: 'bunnygymwear',
    company: 'BunnyGymWear',
    name: 'BunnyGymWear',
    accent: '#F5C24B',
    cover: coverBunny,
    links: { link: null, code: null },
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
    tags: ['Next.js', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript'],
  },

  // 6 — To-Do Automation
  {
    id: 'todo-automation',
    company: 'Personal Project',
    name: 'To-Do Automation',
    accent: '#3DD6C0',
    cover: coverTodo,
    links: { link: null, code: 'https://github.com/AlexisPalacioDev' },
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
] as const;
