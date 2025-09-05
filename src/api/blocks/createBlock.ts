import { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { courseBlocks, CourseBlock } from '../schema';

interface CreateBlockBody {
  kind: string;
  title: string;
  isMandatory?: boolean;
}

// Controller to create a new block for a course
export async function createBlock(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const { kind, title, isMandatory = false } = req.body as CreateBlockBody;

  // Determine next position for the course
  const [last] = await db
    .select({ position: courseBlocks.position })
    .from(courseBlocks)
    .where(eq(courseBlocks.courseId, courseId))
    .orderBy(desc(courseBlocks.position))
    .limit(1);

  const nextPosition = (last?.position ?? 0) + 1;

  // Insert the new block
  const [block] = await db
    .insert(courseBlocks)
    .values({
      courseId,
      kind,
      title,
      isMandatory: isMandatory ? 1 : 0,
      position: nextPosition,
    })
    .returning();

  res.json(block as CourseBlock);
}

export default createBlock;
