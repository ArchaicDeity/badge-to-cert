export interface AssessmentConfig {
  /** Minimum number of questions required for the assessment */
  requiredQuestions?: number;
  /** Alternative property name some callers may use */
  questionCount?: number;
  /** Passing score/percentage between 0 and 100 */
  passingScore?: number;
  // Allow other configuration fields without explicit typing
  [key: string]: unknown;
}

export interface AssessmentBlock {
  type: 'ASSESSMENT';
  questions: unknown[];
  config?: AssessmentConfig;
}

export interface ContentBlock {
  type: 'CONTENT';
  /** Whether this block must contain content before publishing */
  mandatory?: boolean;
  content?: string | null;
}

export type CourseBlock = ContentBlock | AssessmentBlock;

export interface Course {
  status: string;
  version: number;
  blocks: CourseBlock[];
  [key: string]: unknown;
}

/**
 * Validates a course and marks it as published.
 *
 * The function performs the following checks:
 *  - The course contains at least one block
 *  - All mandatory content blocks contain content
 *  - Assessment blocks have questions and a valid configuration
 *
 * On success the course status is set to `PUBLISHED` and the version is
 * incremented by one. A new course object is returned with these updates.
 */
export function publishCourse(course: Course): Course {
  // Ensure blocks exist
  if (!course.blocks || course.blocks.length === 0) {
    throw new Error('Course must contain at least one block');
  }

  // Validate content blocks
  for (const block of course.blocks) {
    if (block.type === 'CONTENT' && block.mandatory) {
      const content = (block as ContentBlock).content;
      if (!content || String(content).trim() === '') {
        throw new Error('Mandatory content blocks must be populated');
      }
    }
  }

  // Validate assessment blocks
  for (const block of course.blocks) {
    if (block.type === 'ASSESSMENT') {
      const assessment = block as AssessmentBlock;

      if (!Array.isArray(assessment.questions) || assessment.questions.length === 0) {
        throw new Error('Assessment blocks require at least one question');
      }

      if (!assessment.config || typeof assessment.config !== 'object') {
        throw new Error('Assessment configuration missing');
      }

      const requiredQuestions =
        assessment.config.requiredQuestions ??
        assessment.config.questionCount ??
        assessment.config.numQuestions ??
        0;

      if (requiredQuestions && assessment.questions.length < requiredQuestions) {
        throw new Error('Assessment does not have sufficient questions');
      }

      if (
        assessment.config.passingScore !== undefined &&
        (typeof assessment.config.passingScore !== 'number' ||
          assessment.config.passingScore <= 0 ||
          assessment.config.passingScore > 100)
      ) {
        throw new Error('Assessment configuration invalid');
      }
    }
  }

  // Return updated course with new status and incremented version
  return {
    ...course,
    status: 'PUBLISHED',
    version: (course.version ?? 0) + 1,
  };
}

export default publishCourse;
