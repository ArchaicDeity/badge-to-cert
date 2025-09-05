import { describe, it, expect } from 'vitest';
import { getAssessmentQuestions } from './questions';

describe('getAssessmentQuestions', () => {
  it('paginates results', () => {
    const result = getAssessmentQuestions({ page: 1, pageSize: 5 });
    expect(result.data).toHaveLength(5);
    expect(result.total).toBeGreaterThan(5);
  });

  it('filters by tag', () => {
    const result = getAssessmentQuestions({ tags: ['cpr'] });
    expect(result.total).toBe(3);
    // ensure all returned questions include the tag
    expect(result.data.every((q) => q.tags.includes('cpr'))).toBe(true);
  });

  it('filters by search term', () => {
    const result = getAssessmentQuestions({ search: 'tourniquet' });
    expect(result.total).toBe(3);
    expect(result.data.every((q) =>
      q.body.toLowerCase().includes('tourniquet') ||
      q.choices.some((c) => c.toLowerCase().includes('tourniquet'))
    )).toBe(true);
  });
});
