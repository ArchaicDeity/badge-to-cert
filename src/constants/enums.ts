/**
 * Centralised application enums.
 *
 * To add new states (e.g. `IN_REVIEW` or `ARCHIVED`):
 * 1. Extend the relevant enum below.
 * 2. Update all UI components, mock data and logic that depend on the enum.
 * 3. Provide labels/styles for new course statuses in `StatusBadge`.
 */
export enum CourseStatus {
  NOT_STARTED = 'NOT_STARTED',
  THEORY_PASS = 'THEORY_PASS',
  PRACTICAL_PASS = 'PRACTICAL_PASS',
  NYC = 'NYC',
}

export enum BlockKind {
  CONTENT = 'CONTENT',
  ASSESSMENT = 'ASSESSMENT',
}

export enum ContentType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
}
