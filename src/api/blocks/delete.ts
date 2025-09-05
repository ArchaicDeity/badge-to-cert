import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { courseBlocks } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.body as { id: number };

  if (typeof id !== 'number') {
    res.status(400).json({ error: 'Invalid block id' });
    return;
  }

  try {
    const block = await db
      .select({ courseId: courseBlocks.courseId, position: courseBlocks.position })
      .from(courseBlocks)
      .where(eq(courseBlocks.id, id))
      .limit(1);

    if (!block.length) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.delete(courseBlocks).where(eq(courseBlocks.id, id));

      const others = await tx
        .select({ id: courseBlocks.id, position: courseBlocks.position })
        .from(courseBlocks)
        .where(
          and(
            eq(courseBlocks.courseId, block[0].courseId),
            gt(courseBlocks.position, block[0].position)
          )
        );

      for (const other of others) {
        await tx
          .update(courseBlocks)
          .set({ position: other.position - 1 })
          .where(eq(courseBlocks.id, other.id));
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete block' });
  }
}
