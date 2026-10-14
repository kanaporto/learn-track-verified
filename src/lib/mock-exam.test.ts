import { describe, expect, it } from 'vitest';
import { drawMock, mockReward, sameAnswer } from './mock-exam';
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
  it('the five certifications are loaded with their full banks', () => {
    expect(Object.fromEntries(builtInCourses.map(c => [c.id, c.questions.length]))).toEqual({ workspace: 370, cloud: 470, okta: 300, itil: 200, apple: 230 });
  });
});
