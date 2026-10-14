import type { Question } from './courses';

export const MOCK_SIZE = 50;
export const PASS_RATIO = 0.7;
export const SECONDS_PER_QUESTION = 72;

/** Mock exam reward: 500 pts for passing, 650 pts for 95 % or more, nothing otherwise. */
export function mockReward(correct: number, total: number) {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 0.95) return 650;
  if (ratio >= PASS_RATIO) return 500;
  return 0;
}

export const sameAnswer = (picked: string[], answer: string[]) =>
  picked.length === answer.length && answer.every(a => picked.includes(a));

/** Balanced draw: each region contributes in proportion to its share of the bank. */
export function drawMock(questions: Question[], size = MOCK_SIZE, rnd = Math.random): Question[] {
  const n = Math.min(size, questions.length);
  const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };
  const byRegion = new Map<number, Question[]>();
  questions.forEach(q => byRegion.set(q.region, [...(byRegion.get(q.region) ?? []), q]));
  const picked: Question[] = [];
  const rest: Question[] = [];
  for (const list of byRegion.values()) {
    const s = shuffle(list);
    const take = Math.floor((list.length / questions.length) * n);
    picked.push(...s.slice(0, take)); rest.push(...s.slice(take));
  }
  picked.push(...shuffle(rest).slice(0, n - picked.length));
  return shuffle(picked);
}
