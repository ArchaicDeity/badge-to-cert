import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { reviewRequests, courses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const reviewId = Number(req.query.id);
  if (Number.isNaN(reviewId)) {
    res.status(400).json({ error: 'Invalid review id' });
    return;
  }

  const { notes, reviewedBy } = req.body as { notes?: string; reviewedBy?: number };

  try {
    await db.transaction(async (tx) => {
      const [request] = await tx
        .update(reviewRequests)
        .set({
          status: 'REJECTED',
          notes,
          reviewedBy,
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(reviewRequests.id, reviewId))
        .returning({ courseId: reviewRequests.courseId });

      if (request?.courseId) {
        await tx
          .update(courses)
          .set({ status: 'DRAFT' })
          .where(eq(courses.id, request.courseId));
      }
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject review' });
  }
}
