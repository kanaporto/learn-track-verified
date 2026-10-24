import { describe, expect, it } from 'vitest';
import { drawMock, drawMockPlan, allocate, MOCK_CONFIGS, mockReward, sameAnswer } from './mock-exam';
import { builtInCourses } from './courses';

describe('mock exam', () => {
  it('passing (70 %) gives 500 points', () => expect(mockReward(35, 50)).toBe(500));
  it('95 % or more gives 650 points', () => expect(mockReward(48, 50)).toBe(650));
  it('failing gives no points', () => expect(mockReward(34, 50)).toBe(0));
  it('multi-answer needs every option and nothing else', () => {
    expect(sameAnswer(['A', 'C'], ['A', 'C'])).toBe(true);
    expect(sameAnswer(['A'], ['A', 'C'])).toBe(false);
  });
  it('draws 50 unique questions covering every region', () => {
    const c = builtInCourses.find(x => x.id === 'okta')!;
    const set = drawMock(c.questions);
    expect(set).toHaveLength(50);
    expect(new Set(set.map(q => q.id)).size).toBe(50);
    expect(new Set(set.map(q => q.region)).size).toBe(c.regions.length);
  });
  it('per-certification sizes and times', () => {
    const v = Object.fromEntries(Object.entries(MOCK_CONFIGS).map(([k, c]) => [k, [c.questions, c.minutes, c.pass]]));
    expect(v).toEqual({ workspace: [50, 120, 0.7], cloud: [50, 90, 0.7], okta: [35, 45, 0.7], itil: [40, 60, 0.65], apple: [80, 120, 0.75] });
  });
  it('Apple 75 % is not rounded: 59/80 fails, 60/80 passes', () => {
    expect(mockReward(59, 80, 0.75)).toBe(0); expect(mockReward(60, 80, 0.75)).toBe(500);
  });
  it('ITIL 26/40 passes, 25/40 fails', () => { expect(mockReward(26, 40, 0.65)).toBe(500); expect(mockReward(25, 40, 0.65)).toBe(0); });
  it('Workspace split follows the official weights', () => {
    expect(allocate([20, 23, 15, 20, 10, 13], 50)).toEqual([10, 11, 7, 10, 5, 7]);
  });
  it('ITIL draws the full 40 with one AI and one frameworks question', () => {
    const c = builtInCourses.find(x => x.id === 'itil')!;
    const r = drawMockPlan(c.questions, MOCK_CONFIGS['itil']!);
    expect(r.shortfall).toBe(false);
    expect(r.questions).toHaveLength(40);
    expect(r.questions.filter(q => q.domain === 'ITIL and AI')).toHaveLength(1);
    expect(r.questions.filter(q => q.domain === 'ITIL and other frameworks')).toHaveLength(1);
  });
  it('Apple draws 80 unique questions with no shortfall', () => {
    const c = builtInCourses.find(x => x.id === 'apple')!;
    const r = drawMockPlan(c.questions, MOCK_CONFIGS['apple']!);
    expect(r.shortfall).toBe(false);
    expect(new Set(r.questions.map(q => q.id)).size).toBe(80);
  });
  it('the five certifications are loaded with their full banks', () => {
    expect(Object.fromEntries(builtInCourses.map(c => [c.id, c.questions.length]))).toEqual({ workspace: 370, cloud: 460, okta: 300, itil: 220, apple: 230 });
  });
  it('Cloud draws all 50 unique questions in the 9/9/9/9/9/5 domain split', () => {
    const c = builtInCourses.find(x => x.id === 'cloud')!;
    const r = drawMockPlan(c.questions, MOCK_CONFIGS['cloud']!);
    expect(r.shortfall).toBe(false);
    expect(r.questions).toHaveLength(50);
    expect(new Set(r.questions.map(q => q.id)).size).toBe(50);
    expect(r.plan.map(p => p.drawn)).toEqual([9, 9, 9, 9, 9, 5]);
  });
});

