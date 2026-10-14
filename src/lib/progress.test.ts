import { describe, expect, it } from 'vitest';
import { playerLevel, pointsFor, leagueFor, regen, MAX_LIVES } from './progress';
import { parseDumpRows } from './courses';

describe('reglas de puntuación', () => {
  it('cada acierto vale 10 × nivel de la pregunta', () => {
    expect(pointsFor(1)).toBe(10);
    expect(pointsFor(5)).toBe(50);
  });
  it('se sube un nivel cada 500 puntos', () => {
    expect(playerLevel(0)).toBe(1);
    expect(playerLevel(499)).toBe(1);
    expect(playerLevel(500)).toBe(2);
    expect(playerLevel(1499)).toBe(3);
  });
  it('ligas Bronce 0–499, Plata 500–1499, Oro 1500+', () => {
    expect(leagueFor(499)).toBe('bronze');
    expect(leagueFor(500)).toBe('silver');
    expect(leagueFor(1500)).toBe('gold');
  });
  it('se recupera 1 vida por hora hasta 10', () => {
    const t0 = 0;
    expect(regen({ lives: 3, livesAt: t0, points: 0, courses: {} }, t0 + 2 * 3_600_000).lives).toBe(5);
    expect(regen({ lives: 9, livesAt: t0, points: 0, courses: {} }, t0 + 5 * 3_600_000).lives).toBe(MAX_LIVES);
  });
});

describe('importador de Excel', () => {
  const head = ['ID', 'Cert', 'Nivel', 'Dominio', 'Tipo', 'Pregunta', 'A', 'B', 'C', 'D'];
  it('agrupa por dominio (el mayor es la región 1) y detecta respuesta múltiple', () => {
    const es = [[], head, ['Q1', 'X', '2', 'Big', '', '¿a?', 'a', 'b', 'c', 'd'], ['Q2', 'X', '1', 'Big', '', '¿b?', 'a', 'b', 'c', 'd'], ['Q3', 'X', '1', 'Small', '', '¿c?', 'a', 'b', 'c', 'd']];
    const ans = [head, ['Q1', 'X', '2', 'Big', 'A, C', 'e', 'e', 'http://x'], ['Q2', 'X', '1', 'Big', 'B'], ['Q3', 'X', '1', 'Small', 'D']];
    const r = parseDumpRows(es, es, ans);
    expect(r.questions).toHaveLength(3);
    expect(r.questions[0]!.answer).toEqual(['A', 'C']);
    expect(r.questions[0]!.multi).toBe(true);
    expect(r.questions.find(q => q.id === 'Q3')!.region).toBe(2);
  });
});

import { msToNextLife as _ms } from './progress';
describe('next life countdown', () => {
  it('is null at 10 lives and one hour after livesAt otherwise', () => {
    expect(_ms({ lives: 10, livesAt: 0, points: 0, courses: {} }, 5)).toBeNull();
    expect(_ms({ lives: 3, livesAt: 0, points: 0, courses: {} }, 600_000)).toBe(3_000_000);
  });
});
