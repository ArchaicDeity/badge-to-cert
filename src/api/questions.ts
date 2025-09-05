import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { questions } from './schema';

export const router = Router();

const itemSchema = z
  .object({
    body: z.string().min(1),
    choices: z.array(z.string()).nonempty(),
    correctIndex: z.number().int().nonnegative(),
    tags: z.array(z.string()).default([]),
  })
  .refine((data) => data.correctIndex < data.choices.length, {
    message: 'correctIndex out of bounds',
    path: ['correctIndex'],
  });

const payloadSchema = z.object({
  assessmentId: z.string().min(1),
  items: z.array(itemSchema),
});

router.post('/questions/bulk', (req, res) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { assessmentId, items } = parsed.data;
  let inserted = 0;
  let failed = 0;

  db.transaction((tx) => {
    for (const item of items) {
      try {
        tx.insert(questions).values({
          assessmentId,
          body: item.body,
          choices: item.choices,
          correctIndex: item.correctIndex,
          tags: item.tags,
        }).run();
        inserted++;
      } catch {
        failed++;
      }
    }
  });

  res.json({ inserted, failed });
});

export default router;
