import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/types';

export type Localized<T> = Readonly<Record<Lang, T>>;

export function pick<T>(loc: Localized<T>, lang: Lang): T {
  return loc[lang];
}

export const WORK_STATUS = {
  LIVE: 'live',
  BACKEND: 'backend',
  ARCHIVED: 'archived',
} as const;

export type WorkStatusKey = (typeof WORK_STATUS)[keyof typeof WORK_STATUS];
export const GITHUB_OVERVIEW = 'https://github.com/AlexisPalacioDev';

export interface WorkLinks {
  link: string | null;
  code: string | null;
}

export interface WorkItem {
  id: string;
  company: string;
  name: string;
  accent: string;
  cover: ImageMetadata;
  links: WorkLinks;
  period: Localized<string>;
  role: Localized<string>;
  kind: Localized<string>;
  status: Localized<string>;
  statusKey: WorkStatusKey;
  desc: Localized<string>;
  bullets: Localized<string[]>;
  tags: readonly string[];
}

import coverAnai from '../../assets/preview-anai.png';
import coverImometrics from '../../assets/preview-imometrics.png';
import coverPoisonflix from '../../assets/preview-poisonflix.png';
import coverPoisonos from '../../assets/preview-poisonos.png';
import coverExtraction from '../../assets/preview-extraction-survivors.png';

export const work: readonly WorkItem[] = [
  {
    id: 'anai',
    company: 'anai',
    name: 'anai',
    accent: '#5B8DEF',
    cover: coverAnai,
    links: { link: 'https://anaiapp.ai', code: null },
    period: { en: 'May 2026 – Present', es: 'may. 2026 – actualidad' },
    role: {
      en: 'Full Stack Developer (frontend focus)',
      es: 'Desarrollador Full Stack (enfoque frontend)',
    },
    kind: { en: 'AI Video Creation SaaS', es: 'SaaS de Creación de Video con IA' },
    status: { en: 'Current', es: 'Actual' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'Full Stack Developer at anai (anaiapp.ai), an AI video creation SaaS. I work on the browser video editor and ship product features end to end.',
      es: 'Desarrollador Full Stack en anai (anaiapp.ai), SaaS de creación de video con IA. Trabajo en el editor de video en el navegador y construyo funcionalidades de producto de punta a punta.'
    },
    bullets: {
      en: [
        'Frontend development with Next.js 16, React 19, and TypeScript',
        'Browser video editor: timeline, subtitles, and export',
        'End-to-end product features with NestJS and MongoDB, such as user retention flows and support with escalation to human agents',
        'AI-assisted development (Claude Code) validated with automated tests (Vitest, Testing Library, Jest, Supertest)'
      ],
      es: [
        'Desarrollo frontend con Next.js 16, React 19 y TypeScript',
        'Editor de video en el navegador: línea de tiempo, subtítulos y exportación',
        'Funcionalidades de punta a punta con NestJS y MongoDB, como flujos de retención de usuarios y soporte con escalado a asesor humano',
        'Desarrollo asistido por agentes de IA (Claude Code), validado con pruebas automatizadas (Vitest, Testing Library, Jest, Supertest)'
      ]
    },
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'NestJS', 'MongoDB', 'Vitest'],
  },
  {
    id: 'imometrics',
    company: 'iMometrics',
    name: 'iMometrics',
    accent: '#0CA1B1',
    cover: coverImometrics,
    links: { link: 'https://imometrics.com', code: null },
    period: { en: 'Jun 2025 – Apr 2026', es: 'jun. 2025 – abr. 2026' },
    role: {
      en: 'Lead Developer',
      es: 'Líder de Desarrollo',
    },
    kind: { en: 'Cold Chain Monitoring', es: 'Monitoreo IoT de Cadena de Frío' },
    status: { en: 'Delivered', es: 'Entregado' },
    statusKey: WORK_STATUS.ARCHIVED,
    desc: {
      en: 'Freelance from Jun 2025; permanent contract as Lead Developer since Sep 2025. Developed and maintained internal applications for the cold-chain IoT monitoring platform.',
      es: 'Freelance desde jun. 2025; contrato indefinido como Líder de Desarrollo desde sep. 2025. Desarrollé y mantuve aplicaciones internas de la plataforma de monitoreo IoT de cadena de frío.',
    },
    bullets: {
      en: [
        'Developed and maintained internal apps with CakePHP 4.6, PHP, and MySQL, including database migrations',
        'Improved existing code following best practices, integrating Composer for dependencies and Docker for development environments'
      ],
      es: [
        'Desarrollé y mantuve aplicaciones internas de la plataforma con CakePHP 4.6, PHP y MySQL, incluyendo migraciones de base de datos',
        'Mejoré código existente siguiendo buenas prácticas, con Composer para dependencias y Docker para entornos de desarrollo'
      ]
    },
    tags: ['CakePHP 4.6', 'PHP', 'MySQL', 'Docker', 'Composer'],
  },
  {
    id: 'poisonflix',
    company: 'Personal Project',
    name: 'PoisonFlix',
    accent: '#E50914',
    cover: coverPoisonflix,
    links: { link: null, code: null },
    period: { en: '2026', es: '2026' },
    role: {
      en: 'Full-Stack Developer',
      es: 'Desarrollador Full-Stack',
    },
    kind: { en: 'Self-Hosted Streaming Platform', es: 'Plataforma de Streaming Autoalojada' },
    status: { en: 'Personal project', es: 'Proyecto personal' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'Self-hosted streaming platform: PWA web client, Android TV app, and cast bridge.',
      es: 'Plataforma de streaming autoalojada: cliente web PWA, app para Android TV y puente de transmisión.',
    },
    bullets: {
      en: [
        'PWA web client built with React and TypeScript',
        'Android TV application built with Kotlin and Jetpack Compose',
        'Cast bridge supporting Google Cast, DIAL, DLNA, and webOS',
        'Over 180 test files and CI in GitHub Actions'
      ],
      es: [
        'Cliente web PWA con React y TypeScript',
        'App para Android TV con Kotlin y Jetpack Compose',
        'Puente de transmisión con Google Cast, DIAL, DLNA y webOS',
        'Más de 180 archivos de pruebas y CI en GitHub Actions'
      ]
    },
    tags: ['React', 'TypeScript', 'PWA', 'Kotlin', 'Jetpack Compose', 'GitHub Actions'],
  },
  {
    id: 'extraction-survivors',
    company: 'Personal Project',
    name: 'Extraction Survivors',
    accent: '#FACC15',
    cover: coverExtraction,
    links: {
      link: 'https://extraction-survivors-client.vercel.app',
      code: 'https://github.com/AlexisPalacioDev/extraction-survivors',
    },
    period: { en: '2026', es: '2026' },
    role: { en: 'Game Developer', es: 'Desarrollador de Juegos' },
    kind: { en: '2D Multiplayer Game', es: 'Juego Multijugador 2D' },
    status: { en: 'Open source', es: 'Código abierto' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: '2D browser multiplayer game for up to 4 players.',
      es: 'Juego multijugador 2D en navegador para hasta 4 jugadores.',
    },
    bullets: {
      en: [
        'Custom ECS engine with fixed timestep',
        'PixiJS/WebGL rendering and WebRTC P2P networking'
      ],
      es: [
        'Motor ECS propio con paso de tiempo fijo',
        'Renderizado PixiJS/WebGL y red WebRTC P2P'
      ]
    },
    tags: ['ECS', 'PixiJS', 'WebGL', 'WebRTC'],
  },
  {
    id: 'poisonos',
    company: 'Personal Project',
    name: 'HY300 PoisonOS',
    accent: '#00D4AA',
    cover: coverPoisonos,
    links: { link: null, code: 'https://github.com/AlexisPalacioDev/hy300-poisonos' },
    period: { en: '2026', es: '2026' },
    role: { en: 'Android Developer', es: 'Desarrollador Android' },
    kind: { en: 'Custom Android Launcher', es: 'Launcher Android Custom' },
    status: { en: 'Open source', es: 'Código abierto' },
    statusKey: WORK_STATUS.LIVE,
    desc: {
      en: 'Android launcher and customization kit without root for the HY300 projector via ADB.',
      es: 'Launcher Android y kit de personalización sin root para el proyector HY300 vía ADB.',
    },
    bullets: {
      en: [
        'Custom launcher built in Kotlin',
        'No root access required, deploys via ADB'
      ],
      es: [
        'Launcher custom construido en Kotlin',
        'No requiere acceso root, se despliega vía ADB'
      ]
    },
    tags: ['Android', 'Kotlin', 'ADB'],
  }
] as const;
