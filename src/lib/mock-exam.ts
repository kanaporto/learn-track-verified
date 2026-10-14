import type { Question } from './courses';

export const MOCK_SIZE = 50;
export const PASS_RATIO = 0.7;
export const SECONDS_PER_QUESTION = 72;

export type MockStatus = 'aligned' | 'partial' | 'knowledge';
export type MockDomain = { en: string; es: string; weight: number; bank: string[] };
export type MockConfig = {
  name: string; questions: number; minutes: number; pass: number;
  /** true when the pass mark is published by the certifier; false = Dumpi Learn's own guideline. */
  officialPass: boolean;
  /** true when the certifier publishes domain weights; false = Dumpi Learn's balanced estimate. */
  officialWeights: boolean;
  status: MockStatus; guide: string; source: string;
  noteEs: string; noteEn: string;
  domains: MockDomain[];
};

const d = (en: string, es: string, weight: number, bank: string[] = [en]): MockDomain => ({ en, es, weight, bank });

/** Per-certification mock exam rules taken from each official guide. */
export const MOCK_CONFIGS: Record<string, MockConfig> = {
  workspace: {
    name: 'Associate Google Workspace Administrator', questions: 50, minutes: 120, pass: 0.7, officialPass: false, officialWeights: true,
    status: 'aligned', guide: 'Associate Google Workspace Administrator exam guide',
    source: 'https://services.google.com/fh/files/misc/associate_google_workspace_administrator_exam_guide_english.pdf',
    noteEs: 'Práctica traducida: el examen oficial se hace en inglés o japonés. Google no publica nota mínima; el 70 % es un criterio orientativo de Dumpi Learn.',
    noteEn: 'Translated practice: the official exam is in English or Japanese. Google does not publish a pass mark; 70 % is a Dumpi Learn guideline.',
    domains: [
      d('User accounts, domains, and Directory', 'Cuentas, dominios y Directory', 20),
      d('Core Workspace services', 'Servicios principales de Workspace', 23),
      d('Data governance and compliance', 'Gobierno de datos y cumplimiento', 15),
      d('Security policies and access controls', 'Políticas de seguridad y controles de acceso', 20),
      d('Browsers and endpoints', 'Navegadores y endpoints', 10),
      d('Monitoring and troubleshooting', 'Monitorización y resolución de problemas', 13),
    ],
  },
  cloud: {
    name: 'Google Cloud Digital Leader', questions: 50, minutes: 90, pass: 0.7, officialPass: false, officialWeights: true,
    status: 'partial', guide: 'Cloud Digital Leader exam guide (12 Aug 2026)',
    source: 'https://services.google.com/fh/files/misc/cloud_digital_leader_exam_guide_english.pdf',
    noteEs: 'Pesos de la guía del 12/08/2026. El banco aún no está revisado frente a los temas nuevos (IA agéntica, Gemini Enterprise Agent Platform, AI Hypercomputer); nueva guía en español desde el 29/10/2026. El 70 % es orientativo de Dumpi Learn.',
    noteEn: 'Weights from the 12 Aug 2026 guide. The bank is not yet reviewed against the new topics (agentic AI, Gemini Enterprise Agent Platform, AI Hypercomputer); new Spanish guide from 29 Oct 2026. 70 % is a Dumpi Learn guideline.',
    domains: [
      d('Digital transformation with Google Cloud', 'Transformación digital con Google Cloud', 18),
      d('Data transformation', 'Exploración de la transformación de datos', 18),
      d('Artificial intelligence', 'Innovación con inteligencia artificial', 18),
      d('Infrastructure and applications', 'Modernización de infraestructura y aplicaciones', 18),
      d('Trust and security', 'Confianza y seguridad', 18),
      d('Scaling operations with Google Cloud', 'Escalado de operaciones con Google Cloud', 10, ['Operations and costs']),
    ],
  },
  okta: {
    name: 'Okta Certified Administrator', questions: 35, minutes: 45, pass: 0.7, officialPass: false, officialWeights: true,
    status: 'knowledge', guide: 'Okta Administrator Hands-On Configuration (Part I)',
    source: 'https://www.okta.com/resources/administrator-hands-on-exam-study-guide/',
    noteEs: 'Práctica de conocimientos con los pesos de la Parte I. No incluye el formato DOMC ni los 4 casos prácticos (Parte II, 120 min). Okta solo publica aprobado/suspenso; el 70 % es orientativo de Dumpi Learn.',
    noteEn: 'Knowledge practice using Part I weights. It does not include the DOMC format or the 4 hands-on tasks (Part II, 120 min). Okta only publishes pass/fail; 70 % is a Dumpi Learn guideline.',
    domains: [
      d('Identity and Access Management', 'Gestión de identidades y accesos', 37, ['Directory and federation']),
      d('User Lifecycle Management', 'Ciclo de vida de usuarios', 29, ['Lifecycle, profiles and groups']),
      d('Security', 'Seguridad', 20, ['Security and policies']),
      d('Monitoring and Troubleshooting', 'Monitorización y resolución de problemas', 9, ['Monitoring and troubleshooting']),
      d('API Functions', 'Funciones de API', 6, ['Administration and API']),
    ],
  },
  itil: {
    name: 'ITIL Foundation (Version 5)', questions: 40, minutes: 60, pass: 0.65, officialPass: true, officialWeights: true,
    status: 'aligned', guide: 'ITIL Foundation Version 5 syllabus v5.0',
    source: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-5-foundation-version-50-4154',
    noteEs: 'Libro cerrado. Aprobado oficial: 65 % (26 de 40).', noteEn: 'Closed book. Official pass mark: 65 % (26 of 40).',
    domains: [
      d('Key ITIL terms and definitions', 'Términos y definiciones clave de ITIL', 30),
      d('The four dimensions', 'Las cuatro dimensiones', 10),
      d('Product and service lifecycle', 'Ciclo de vida de productos y servicios', 10),
      d('The ITIL value system', 'Sistema de valor ITIL', 40),
      d('Value streams', 'Flujos de valor', 5),
      d('ITIL and AI', 'ITIL e IA', 2.5),
      d('ITIL and other frameworks', 'ITIL y otros marcos', 2.5),
    ],
  },
  apple: {
    name: 'Apple Device Support', questions: 80, minutes: 120, pass: 0.75, officialPass: true, officialWeights: false,
    status: 'aligned', guide: 'Apple Device Support Exam Preparation Guide',
    source: 'https://training.apple.com/content/dam/appletraining/us/en/2025/documents/Apple%20Device%20Support%20Exam%20Prep%20Guide%20EN.pdf',
    noteEs: 'Sin recursos. Aprobado oficial: 75 %, sin redondeo. Apple no publica pesos por dominio: reparto equilibrado, estimación de Dumpi Learn.',
    noteEn: 'No resources allowed. Official pass mark: 75 %, not rounded. Apple publishes no domain weights: balanced split, a Dumpi Learn estimate.',
    domains: ['Setup, accounts and management|Configuración, cuentas y gestión', 'Security and privacy|Seguridad y privacidad', 'Networks and connectivity|Redes y conectividad', 'Backup and recovery|Copias y recuperación', 'Updates and apps|Actualizaciones y apps', 'Diagnostics and performance|Diagnóstico y rendimiento']
      .map(s => { const [en, es] = s.split('|') as [string, string]; return d(en, es, 1); }),
  },
};

/** Fallback for uploaded courses: 50 questions, balanced by bank domain (Dumpi Learn estimate). */
export function mockConfigFor(courseId: string, questions: Question[]): MockConfig {
  const known = MOCK_CONFIGS[courseId];
  if (known) return known;
  const names = Array.from(new Set(questions.map(q => q.domain)));
  return {
    name: courseId, questions: MOCK_SIZE, minutes: Math.round(MOCK_SIZE * SECONDS_PER_QUESTION / 60), pass: PASS_RATIO, officialPass: false, officialWeights: false,
    status: 'knowledge', guide: '', source: '',
    noteEs: 'Curso subido: reparto equilibrado por dominio y aprobado del 70 %, criterios orientativos de Dumpi Learn.',
    noteEn: 'Uploaded course: balanced split by domain and 70 % pass mark, both Dumpi Learn guidelines.',
    domains: names.map(n => d(n, n, 1)),
  };
}

/** Largest-remainder split of `total` by weights; ties go to the domain with more available questions. */
export function allocate(weights: number[], total: number, available: number[] = weights.map(() => 0)): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map(w => (w / sum) * total);
  const out = raw.map(Math.floor);
  const order = raw.map((r, i) => i).sort((a, b) => (raw[b]! - out[b]!) - (raw[a]! - out[a]!) || available[b]! - available[a]!);
  for (let k = 0; k < total - out.reduce((a, b) => a + b, 0); k++) out[order[k % order.length]!]!++;
  return out;
}

export type DomainPlan = { domain: MockDomain; target: number; available: number; drawn: number };
export type MockDraw = { questions: Question[]; plan: DomainPlan[]; shortfall: boolean };

/** Stratified draw: each official domain gets its blueprint share; missing questions are reported, never back-filled. */
export function drawMockPlan(questions: Question[], cfg: MockConfig, rnd = Math.random): MockDraw {
  const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };
  const pools = cfg.domains.map(dm => questions.filter(q => dm.bank.includes(q.domain)));
  const targets = allocate(cfg.domains.map(x => x.weight), cfg.questions, pools.map(p => p.length));
  const picked: Question[] = [];
  const plan = cfg.domains.map((domain, i) => {
    const take = shuffle(pools[i]!).slice(0, targets[i]);
    picked.push(...take);
    return { domain, target: targets[i]!, available: pools[i]!.length, drawn: take.length };
  });
  return { questions: shuffle(picked), plan, shortfall: plan.some(p => p.drawn < p.target) };
}

/** Which official domain a question counts towards in a mock exam. */
export const domainOf = (cfg: MockConfig, q: Question) => cfg.domains.find(dm => dm.bank.includes(q.domain));

/** Backwards-compatible balanced draw used for uploaded courses. */
export function drawMock(questions: Question[], size = MOCK_SIZE, rnd = Math.random): Question[] {
  const cfg = { ...mockConfigFor('__custom', questions), questions: Math.min(size, questions.length) };
  return drawMockPlan(questions, cfg, rnd).questions;
}

/** Mock exam reward: 500 pts for passing, 650 pts for 95 % or more, nothing otherwise. Pass is not rounded. */
export function mockReward(correct: number, total: number, pass = PASS_RATIO) {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 0.95) return 650;
  if (ratio >= pass) return 500;
  return 0;
}

export const sameAnswer = (picked: string[], answer: string[]) =>
  picked.length === answer.length && answer.every(a => picked.includes(a));
