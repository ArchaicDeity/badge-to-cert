import type { Request, Response } from 'express';
import { db } from '@/db';
import { courseBlocks } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

interface AddBlockBody {
  courseId: number;
  kind: 'CONTENT' | 'ASSESSMENT';
  title: string;
  position?: number;
  isMandatory?: boolean;
  disabled?: boolean;
  configJson?: string | null;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { courseId, kind, title, position, isMandatory = true, disabled = false, configJson = null } = req.body as AddBlockBody;

  if (!courseId || !kind || !title) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const newBlock = await db.transaction(async (tx) => {
      let insertPosition = position;

      if (insertPosition && insertPosition > 0) {
        const others = await tx
          .select({ id: courseBlocks.id, position: courseBlocks.position })
          .from(courseBlocks)
          .where(
            and(
              eq(courseBlocks.courseId, courseId),
              gte(courseBlocks.position, insertPosition)
            )
          );

        for (const other of others) {
          await tx
            .update(courseBlocks)
            .set({ position: other.position + 1 })
            .where(eq(courseBlocks.id, other.id));
        }
      } else {
        const last = await tx
          .select({ position: courseBlocks.position })
          .from(courseBlocks)
          .where(eq(courseBlocks.courseId, courseId))
          .orderBy(desc(courseBlocks.position))
          .limit(1);
        insertPosition = last.length ? last[0].position + 1 : 1;
      }

      const inserted = await tx
        .insert(courseBlocks)
        .values({
          courseId,
          kind,
          title,
          position: insertPosition,
          isMandatory,
          disabled,
          configJson,
        })
        .returning();

      return inserted[0];
    });

    res.status(200).json({ block: newBlock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add block' });
  }
}
