import { describe, it, expect } from 'vitest';
import { mockQuestions } from './mockData';

describe('mockQuestions', () => {
  it('has expected number of questions', () => {
    expect(mockQuestions).toHaveLength(9);
  });
});
