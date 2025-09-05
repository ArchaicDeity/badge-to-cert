import { asc, eq } from 'drizzle-orm';

// These imports assume corresponding modules exist in the API layer.
// The actual implementation of the database connection and schema
// definitions are outside the scope of this function.
import { db } from '../db';
import {
  courses,
  courseBlocks,
  contentBlocks,
  quizBlocks,
} from '../schema';

interface BlockRow {
  course: typeof courses.$inferSelect;
  blockId: number;
  position: number;
  type: string;
  isMandatory: boolean;
  content: typeof contentBlocks.$inferSelect | null;
  quiz: typeof quizBlocks.$inferSelect | null;
}

export async function getCourse(id: number) {
  // Query course and associated blocks ordered by position
  const rows = await db
    .select({
      course: courses,
      blockId: courseBlocks.blockId,
      position: courseBlocks.position,
      type: courseBlocks.type,
      isMandatory: courseBlocks.isMandatory,
      content: contentBlocks,
      quiz: quizBlocks,
    })
    .from(courses)
    .innerJoin(courseBlocks, eq(courseBlocks.courseId, courses.id))
    .leftJoin(contentBlocks, eq(contentBlocks.id, courseBlocks.blockId))
    .leftJoin(quizBlocks, eq(quizBlocks.id, courseBlocks.blockId))
    .where(eq(courses.id, id))
    .orderBy(asc(courseBlocks.position));

  if (rows.length === 0) return undefined;

  const courseInfo = rows[0].course;
  const blocks = rows.map((row: BlockRow) => ({
    id: row.blockId,
    position: row.position,
    type: row.type,
    isMandatory: row.isMandatory,
    data: row.type === 'quiz' ? row.quiz : row.content,
  }));

  return { ...courseInfo, blocks };
}
