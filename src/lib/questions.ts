import { mockQuestions, type Question } from './mockData';

export interface QuestionQuery {
  page?: number;
  pageSize?: number;
  tags?: string[];
  search?: string;
}

export interface QuestionPage {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Returns a paginated list of questions filtered by tags or search term.
 */
export function getAssessmentQuestions({
  page = 1,
  pageSize = 10,
  tags = [],
  search = '',
}: QuestionQuery = {}): QuestionPage {
  let filtered = mockQuestions;

  if (tags.length) {
    filtered = filtered.filter((q) => tags.every((t) => q.tags.includes(t)));
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.body.toLowerCase().includes(term) ||
        q.choices.some((choice) => choice.toLowerCase().includes(term))
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
  };
}
