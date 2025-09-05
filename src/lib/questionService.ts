import { mockQuestions, type Question } from './mockData';

/**
 * Insert a question into the mock question bank after validating
 * that required fields for each question type are present.
 */
export function insertQuestion(question: Question): void {
  if (question.type === 'MCQ') {
    if (!question.choices || question.choices.length < 2) {
      throw new Error('MCQ questions require at least two choices');
    }
    if (typeof question.correctIndex !== 'number') {
      throw new Error('MCQ questions require a correctIndex');
    }
    if (question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
      throw new Error('correctIndex must reference an index of choices');
    }
  } else if (question.type === 'TF') {
    if (typeof question.correctBool !== 'boolean') {
      throw new Error('TF questions require correctBool');
    }
    if (question.choices && question.choices.length > 0) {
      throw new Error('TF questions should not include choices');
    }
    if (typeof question.correctIndex !== 'undefined') {
      throw new Error('TF questions should not include correctIndex');
    }
  } else {
    throw new Error('Unsupported question type');
  }

  mockQuestions.push(question);
}
