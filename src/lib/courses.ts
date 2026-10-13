import { useEffect, useState } from 'react';
import bank from '@/data/workspace-questions.json';

export type Question = { id: string; level: number; domain: string; region: number; multi: boolean; es: { q: string; o: string[] }; en: { q: string; o: string[] }; answer: string[]; expEs: string; expEn: string; ref: string };
export type Region = { n: number; es: string; en: string; color: string; domain: string };
export type Course = { id: string; name: string; category: string; icon: string; custom: boolean; regions: Region[]; questions: Question[] };

const COLORS = ['#2563EB', '#0284C7', '#0D9488', '#6366F1', '#D97706', '#E11D48'];
const workspaceRegions: Region[] = [
  { n: 1, es: 'El Bosque de los Caminos', en: 'The Forest of Paths', color: '#2563EB', domain: '' },
  { n: 2, es: 'La Ribera y el Molino', en: 'The Riverside Mill', color: '#0284C7', domain: '' },
  { n: 3, es: 'El Monasterio de los Pergaminos', en: 'The Scroll Monastery', color: '#0D9488', domain: '' },
  { n: 4, es: 'El Castillo del Foso', en: 'The Moat Castle', color: '#6366F1', domain: '' },
  { n: 5, es: 'El Faro del Vigía', en: 'The Watchtower', color: '#D97706', domain: '' },
  { n: 6, es: 'La Calzada del Maestro', en: "The Master's Road", color: '#E11D48', domain: '' },
];

export const workspaceCourse: Course = {
  id: 'workspace', name: 'Google Workspace Administrator', category: 'Google Workspace', icon: 'workspace', custom: false,
  regions: workspaceRegions, questions: bank as Question[],
};

const KEY = 'dumpi-custom-courses';
const EVT = 'dumpi-courses';
type Stored = { id: string; name: string; category: string; questions: Question[] };

/** Regions come from the domains of the dump, biggest domain first. */
export function regionsFor(questions: Question[]): Region[] {
  const max = Math.max(0, ...questions.map(q => q.region));
  return Array.from({ length: max }, (_, i) => {
    const domain = questions.find(q => q.region === i + 1)?.domain ?? '';
    return { n: i + 1, es: domain, en: domain, color: COLORS[i % COLORS.length]!, domain };
  });
}

function readStored(): Stored[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Stored[]; } catch { return []; }
}
export function customCourses(): Course[] {
  return readStored().map(s => ({ ...s, icon: 'custom', custom: true, regions: regionsFor(s.questions) }));
}
export function saveCourse(c: Stored) {
  const list = readStored().filter(x => x.id !== c.id);
  localStorage.setItem(KEY, JSON.stringify([...list, c]));
  window.dispatchEvent(new Event(EVT));
}
export function deleteCourse(id: string) {
  localStorage.setItem(KEY, JSON.stringify(readStored().filter(x => x.id !== id)));
  window.dispatchEvent(new Event(EVT));
}
export function slug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'curso';
}

/** All playable courses (built-in + uploaded). Custom ones appear after hydration. */
export function useCourses() {
  const [list, setList] = useState<Course[]>([workspaceCourse]);
  useEffect(() => {
    const read = () => setList([workspaceCourse, ...customCourses()]);
    read();
    window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);
  return list;
}

// ---------- Excel dump parser (same layout as Google_Workspace_110_preguntas_ES_EN.xlsx) ----------
type Row = (string | number | null | undefined)[];
function table(rows: Row[]) {
  const h = rows.findIndex(r => String(r[0] ?? '').trim().toUpperCase() === 'ID');
  if (h < 0) return [];
  return rows.slice(h + 1).filter(r => String(r[0] ?? '').trim());
}
const s = (v: unknown) => String(v ?? '').trim();

export type ParseResult = { questions: Question[]; certification: string; errors: string[] };

export function parseDumpRows(es: Row[], en: Row[], ans: Row[]): ParseResult {
  const errors: string[] = [];
  const enMap = new Map(table(en).map(r => [s(r[0]), r]));
  const ansMap = new Map(table(ans).map(r => [s(r[0]), r]));
  const raw: Omit<Question, 'region'>[] = [];
  let certification = '';
  for (const r of table(es)) {
    const id = s(r[0]);
    const e = enMap.get(id); const a = ansMap.get(id);
    if (!e || !a) { errors.push(`${id}: falta en ${!e ? 'Test EN' : 'Respuestas'}`); continue; }
    const answer = Array.from(new Set(s(a[4]).toUpperCase().match(/[A-D]/g) ?? []));
    if (!answer.length) { errors.push(`${id}: sin respuesta correcta`); continue; }
    certification ||= s(r[1]);
    raw.push({
      id, level: Math.min(5, Math.max(1, Number(r[2]) || 1)), domain: s(e[3]) || s(r[3]), multi: answer.length > 1,
      es: { q: s(r[5]), o: [s(r[6]), s(r[7]), s(r[8]), s(r[9])] },
      en: { q: s(e[5]), o: [s(e[6]), s(e[7]), s(e[8]), s(e[9])] },
      answer, expEs: s(a[5]), expEn: s(a[6]), ref: s(a[7]),
    });
  }
  const counts = new Map<string, number>();
  raw.forEach(q => counts.set(q.domain, (counts.get(q.domain) ?? 0) + 1));
  const order = [...counts.entries()].sort((x, y) => y[1] - x[1]).map(([d]) => d);
  return { certification, errors, questions: raw.map(q => ({ ...q, region: order.indexOf(q.domain) + 1 })) };
}

export async function parseDumpFile(buf: ArrayBuffer): Promise<ParseResult> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buf, { type: 'array' });
  const get = (name: string) => {
    const ws = wb.Sheets[name] ?? wb.Sheets[wb.SheetNames.find(n => n.trim().toLowerCase() === name.toLowerCase()) ?? ''];
    return ws ? (XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as Row[]) : null;
  };
  const es = get('Test ES'), en = get('Test EN'), ans = get('Respuestas');
  if (!es || !en || !ans) return { questions: [], certification: '', errors: ['El Excel debe tener las hojas «Test ES», «Test EN» y «Respuestas».'] };
  return parseDumpRows(es, en, ans);
}
