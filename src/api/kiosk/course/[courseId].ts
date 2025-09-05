import type { Request, Response } from 'express';
import { db } from '@/db';
import { courses, courseBlocks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const courseId = Number(req.params.courseId);
  if (!courseId) {
    res.status(400).json({ error: 'Invalid courseId' });
    return;
  }

  try {
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course.length || course[0].status !== 'PUBLISHED') {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const blocks = await db
      .select()
      .from(courseBlocks)
      .where(eq(courseBlocks.courseId, courseId))
      .orderBy(asc(courseBlocks.position));

    res.status(200).json({ blocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course blocks' });
  }
}

