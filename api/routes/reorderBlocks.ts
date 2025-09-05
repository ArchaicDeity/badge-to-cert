import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { blocks } from '../schema';

export const reorderBlocksRouter = Router();

reorderBlocksRouter.post('/', (req, res) => {
  const { courseId, order } = req.body as { courseId: number; order: number[] };

  if (
    typeof courseId !== 'number' ||
    !Array.isArray(order) ||
    order.some((id) => typeof id !== 'number')
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const existing = db
    .select({ id: blocks.id })
    .from(blocks)
    .where(eq(blocks.courseId, courseId))
    .all();

  const existingIds = existing.map((b) => b.id);
  const orderSet = new Set(order);

  if (
    existingIds.length !== order.length ||
    existingIds.some((id) => !orderSet.has(id))
  ) {
    return res
      .status(400)
      .json({ error: 'Order does not match existing blocks' });
  }

  db.transaction((tx) => {
    order.forEach((blockId, index) => {
      tx.update(blocks)
        .set({ position: index })
        .where(eq(blocks.id, blockId))
        .run();
    });
  });

  return res.json({ success: true });
});
