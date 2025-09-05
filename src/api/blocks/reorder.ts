import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';
import { courseBlocks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { courseId, order } = req.body as { courseId: number; order: number[] };

  if (!Array.isArray(order)) {
    res.status(400).json({ error: 'Invalid order array' });
    return;
  }

  try {
    // Test database connection before starting the transaction.
    await db.select({ id: courseBlocks.id }).from(courseBlocks).limit(1);
  } catch (err) {
    console.error('Database connection failed', err);
    res.status(500).json({ error: 'Database connection failed' });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      for (const [index, blockId] of order.entries()) {
        await tx.update(courseBlocks)
          .set({ position: index + 1 })
          .where(eq(courseBlocks.id, blockId));
      }
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder blocks' });
  }
}
