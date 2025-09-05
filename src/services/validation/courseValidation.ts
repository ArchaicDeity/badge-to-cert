export interface ValidationIssue {
  blockId?: string;
  questionId?: string;
  message: string;
}

export interface PdfBlock {
  id: string;
  type: 'pdf';
  file?: string; // path or URL
}

export interface HtmlBlock {
  id: string;
  type: 'html';
  body?: string;
}

export interface LinkBlock {
  id: string;
  type: 'link';
  url?: string;
}

export interface MCQQuestion {
  id: string;
  type: 'MCQ' | 'mcq';
  choices: string[];
  correct_index: number;
}

export interface TFQuestion {
  id: string;
  type: 'TF' | 'tf';
  correct_bool: number;
}

export type Question = MCQQuestion | TFQuestion | { id: string; type: string; };

export interface AssessmentBlock {
  id: string;
  type: 'assessment';
  num_questions: number;
  question_bank: Question[];
}

export type CourseBlock = PdfBlock | HtmlBlock | LinkBlock | AssessmentBlock | { id: string; type: string };

export interface Course {
  blocks: CourseBlock[];
}

/**
 * Validate a course configuration.
 * Returns an array of issues with block and/or question identifiers.
 */
export function validateCourse(course: Course): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // At least one block exists
  if (!course.blocks || course.blocks.length === 0) {
    issues.push({ message: 'Course has no blocks' });
    return issues; // No need to continue if no blocks
  }

  course.blocks.forEach((block) => {
    const blockType = block.type?.toLowerCase?.();

    if (blockType === 'pdf') {
      const pdf = block as PdfBlock;
      if (!pdf.file) {
        issues.push({ blockId: pdf.id, message: 'PDF block missing file' });
      }
    } else if (blockType === 'html') {
      const html = block as HtmlBlock;
      if (!html.body) {
        issues.push({ blockId: html.id, message: 'HTML block missing body' });
      }
    } else if (blockType === 'link') {
      const link = block as LinkBlock;
      try {
        if (!link.url) throw new Error('');
        // eslint-disable-next-line no-new
        new URL(link.url);
      } catch {
        issues.push({ blockId: link.id, message: 'Link block has invalid URL' });
      }
    } else if (blockType === 'assessment') {
      const assessment = block as AssessmentBlock;

      // num_questions ≥ 1
      if (typeof assessment.num_questions !== 'number' || assessment.num_questions < 1) {
        issues.push({ blockId: assessment.id, message: 'Assessment must request at least one question' });
      }

      const bank = assessment.question_bank || [];

      // question bank has ≥ num_questions valid questions
      if (bank.length < assessment.num_questions) {
        issues.push({ blockId: assessment.id, message: 'Question bank has fewer questions than required' });
      }

      bank.forEach((q) => {
        const qType = q.type?.toLowerCase?.();

        if (qType === 'mcq') {
          const mcq = q as MCQQuestion;
          if (!mcq.choices || mcq.choices.length < 2) {
            issues.push({ blockId: assessment.id, questionId: mcq.id, message: 'MCQ must have at least two choices' });
          }
          if (
            typeof mcq.correct_index !== 'number' ||
            mcq.correct_index < 0 ||
            !mcq.choices ||
            mcq.correct_index >= mcq.choices.length
          ) {
            issues.push({ blockId: assessment.id, questionId: mcq.id, message: 'MCQ has invalid correct_index' });
          }
        } else if (qType === 'tf') {
          const tf = q as TFQuestion;
          if (tf.correct_bool !== 0 && tf.correct_bool !== 1) {
            issues.push({ blockId: assessment.id, questionId: tf.id, message: 'TF question correct_bool must be 0 or 1' });
          }
        } else {
          issues.push({ blockId: assessment.id, questionId: q.id, message: 'Unknown question type' });
        }
      });
    }
  });

  return issues;
}

