import { useEffect, useState } from 'react';

export const MAX_LIVES = 10;
export const POINTS_PER_LEVEL_UP = 500;
const HOUR = 3_600_000;
const KEY = 'dumpi-progress';
const EVT = 'dumpi-progress';

export type CourseProgress = { completed: number[]; tiles: Record<string, number>; lastRegion?: number };
export type Progress = { lives: number; livesAt: number; points: number; courses: Record<string, CourseProgress> };

/** Points for a correct answer: 10 × question level. */
export const pointsFor = (questionLevel: number) => 10 * questionLevel;
/** Player level: one level every 500 points, starting at level 1. */
export const playerLevel = (points: number) => 1 + Math.floor(Math.max(0, points) / POINTS_PER_LEVEL_UP);
/** League by points: Bronze 0–499, Silver 500–1499, Gold 1500+. */
export const leagueFor = (points: number) => (points >= 1500 ? 'gold' : points >= 500 ? 'silver' : 'bronze');

/** Lives regenerate 1 per hour up to the max. */
export function regen(p: Progress, now = Date.now()): Progress {
  if (p.lives >= MAX_LIVES) return { ...p, livesAt: now };
  const gained = Math.floor((now - p.livesAt) / HOUR);
  if (gained <= 0) return p;
  const lives = Math.min(MAX_LIVES, p.lives + gained);
  return { ...p, lives, livesAt: lives >= MAX_LIVES ? now : p.livesAt + gained * HOUR };
}

const fresh = (): Progress => ({ lives: MAX_LIVES, livesAt: Date.now(), points: 0, courses: {} });
export function readProgress(): Progress {
  try { const raw = localStorage.getItem(KEY); return regen(raw ? { ...fresh(), ...JSON.parse(raw) } : fresh()); } catch { return fresh(); }
}
export function updateProgress(fn: (p: Progress) => Progress) {
  const next = fn(readProgress());
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
  return next;
}
export function resetProgress() { localStorage.removeItem(KEY); window.dispatchEvent(new Event(EVT)); }
export const courseOf = (p: Progress, id: string): CourseProgress => p.courses[id] ?? { completed: [], tiles: {} };
export function patchCourse(id: string, fn: (c: CourseProgress) => CourseProgress) {
  return updateProgress(p => ({ ...p, courses: { ...p.courses, [id]: fn(courseOf(p, id)) } }));
}
export function setLives(n: number) {
  return updateProgress(p => ({ ...p, lives: Math.max(0, Math.min(MAX_LIVES, n)), livesAt: p.lives >= MAX_LIVES ? Date.now() : p.livesAt }));
}

/** Undefined until hydrated. */
export function useProgress() {
  const [p, setP] = useState<Progress | undefined>(undefined);
  useEffect(() => {
    const read = () => setP(readProgress());
    read();
    const id = setInterval(read, 60_000);
    window.addEventListener(EVT, read);
    return () => { clearInterval(id); window.removeEventListener(EVT, read); };
  }, []);
  return p;
}
