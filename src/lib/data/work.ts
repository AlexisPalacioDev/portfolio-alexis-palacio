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
import coverAnai from '../../assets/cover-anai.png';
import coverImometrics from '../../assets/cover-imometrics.png';
import coverSticker from '../../assets/cover-sticker.png';
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
    links: { link: null, code: null },
    period: { en: '2024 — Present', es: '2024 — Hoy' },
    role: {
      en: 'AI Engineer & Full-Stack Developer',
      es: 'Ingeniero IA & Desarrollador Full-Stack',
    },
    kind: { en: 'AI Content Platform', es: 'Plataforma de Contenido IA' },
    status: { en: 'Current', es: 'Actual' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'Building the AI content generation engine at anai — a platform that automates brand-aligned content at scale using LLM orchestration, custom agent loops and structured output pipelines.',
      es: 'Construyendo el motor de generación de contenido con IA en anai — una plataforma que automatiza contenido alineado con la marca a escala, usando orquestación de LLMs, loops de agentes a medida y pipelines de salida estructurada.',
    },
    bullets: {
      en: [
        'Designed multi-agent orchestration architecture (planner → writer → validator loops)',
        'Integrated OpenAI, Anthropic and local models via OpenRouter with fallback chains',
        'Built MCP servers to connect agents to external data sources and brand assets',
        'Implemented structured output validation and retry strategies for production reliability',
      ],
      es: [
        'Diseñé arquitectura de orquestación multi-agente (loops planificador → escritor → validador)',
        'Integré OpenAI, Anthropic y modelos locales vía OpenRouter con cadenas de fallback',
        'Construí servidores MCP para conectar agentes a fuentes de datos externas y assets de marca',
        'Implementé validación de salida estructurada y estrategias de reintento para confiabilidad en producción',
      ],
    },
    tags: ['AI Agents', 'LLM Orchestration', 'MCP', 'OpenAI', 'Anthropic', 'Next.js', 'Supabase', 'TypeScript'],
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
    tags: ['Node.js', 'PHP', 'MySQL', 'REST API', 'Redis', 'AWS', 'Docker'],
  },

  // 2 — Sticker Drops
  {
    id: 'sticker-drops',
    company: 'Sticker Drops',
    name: 'Sticker Drops',
    accent: '#FF5CA8',
    cover: coverSticker,
    links: { link: null, code: null },
    period: { en: '2023', es: '2023' },
    role: {
      en: 'Full-Stack Developer',
      es: 'Desarrollador Full-Stack',
    },
    kind: { en: 'E-commerce Platform', es: 'Plataforma de Comercio Electrónico' },
    status: { en: 'Archived', es: 'Archivado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: '[Placeholder — description and stack pending confirmation from Alexis. This is a sticker marketplace / drop platform with e-commerce capabilities.]',
      es: '[Placeholder — descripción y stack pendientes de confirmación con Alexis. Marketplace de stickers / plataforma de drops con capacidades de e-commerce.]',
    },
    bullets: {
      en: [
        'Placeholder bullet — awaiting confirmation from Alexis',
        'Full-stack implementation with e-commerce flow',
        'Integrated payment processing',
      ],
      es: [
        'Placeholder — pendiente de confirmación con Alexis',
        'Implementación full-stack con flujo de e-commerce',
        'Integración de procesamiento de pagos',
      ],
    },
    tags: ['Next.js', 'React', 'TypeScript', 'Stripe', 'Supabase'],
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
    tags: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind', 'TypeScript'],
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
    tags: ['OpenAI', 'RAG', 'LangChain', 'Python', 'Next.js', 'Supabase', 'pgvector'],
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
    tags: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Stripe', 'Tailwind', 'TypeScript'],
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
    tags: ['n8n', 'OpenAI', 'Notion API', 'Google Calendar', 'Slack', 'Node.js', 'TypeScript'],
  },
] as const;
