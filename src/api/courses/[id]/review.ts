import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { courses, reviewRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = Number(req.query.id);
  if (Number.isNaN(courseId)) {
    res.status(400).json({ error: 'Invalid course id' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const review = await db
        .select()
        .from(reviewRequests)
        .where(eq(reviewRequests.courseId, courseId))
        .orderBy(desc(reviewRequests.createdAt))
        .limit(1);
      res.status(200).json({ review: review[0] ?? null });
      return;
    }

    if (req.method === 'POST') {
      const { submittedBy, notes } = req.body as {
        submittedBy?: number;
        notes?: string;
      };
      const review = await db
        .insert(reviewRequests)
        .values({ courseId, submittedBy, notes })
        .returning();
      await db
        .update(courses)
        .set({ status: 'IN_REVIEW' })
        .where(eq(courses.id, courseId));
      res.status(201).json({ review: review[0] });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to handle review request' });
  }
}
