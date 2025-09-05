import type { Request, Response } from 'express';
import { db } from '@/db';
import { courseBlocks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
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
      .select({ isMandatory: courseBlocks.isMandatory })
      .from(courseBlocks)
      .where(eq(courseBlocks.id, id))
      .limit(1);

    if (!block.length) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    const newValue = !block[0].isMandatory;
    await db.update(courseBlocks).set({ isMandatory: newValue }).where(eq(courseBlocks.id, id));

    res.status(200).json({ id, isMandatory: newValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle mandatory flag' });
  }
}
