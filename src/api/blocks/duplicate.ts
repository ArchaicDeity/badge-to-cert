import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { courseBlocks } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const block = await db.select().from(courseBlocks).where(eq(courseBlocks.id, id)).limit(1);

    if (!block.length) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    const original = block[0];

    const inserted = await db.transaction(async (tx) => {
      const others = await tx
        .select({ id: courseBlocks.id, position: courseBlocks.position })
        .from(courseBlocks)
        .where(
          and(
            eq(courseBlocks.courseId, original.courseId),
            gt(courseBlocks.position, original.position)
          )
        );

      for (const other of others) {
        await tx
          .update(courseBlocks)
          .set({ position: other.position + 1 })
          .where(eq(courseBlocks.id, other.id));
      }

      const newBlocks = await tx
        .insert(courseBlocks)
        .values({
          courseId: original.courseId,
          kind: original.kind,
          title: original.title,
          position: original.position + 1,
          isMandatory: original.isMandatory,
          disabled: original.disabled,
          configJson: original.configJson,
        })
        .returning();

      return newBlocks[0];
    });

    res.status(200).json({ block: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to duplicate block' });
  }
}
