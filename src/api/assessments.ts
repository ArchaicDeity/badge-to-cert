import express from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { assessments, blocks } from './schema';

const router = express.Router();

router.post('/', (req, res) => {
  const {
    blockId,
    num_questions,
    pass_mark_percent,
    time_limit_minutes,
    shuffle,
    max_attempts,
    cooldown_minutes,
  } = req.body ?? {};

  if (
    typeof blockId !== 'number' ||
    typeof num_questions !== 'number' ||
    typeof pass_mark_percent !== 'number'
  ) {
    return res.status(400).json({
      error: 'blockId, num_questions and pass_mark_percent are required numeric fields',
    });
  }

  const block = db.select().from(blocks).where(eq(blocks.id, blockId)).get();

  if (!block || block.type !== 'ASSESSMENT') {
    return res.status(400).json({ error: 'blockId must reference an ASSESSMENT block' });
  }

  db.insert(assessments)
    .values({
      blockId,
      numQuestions: num_questions,
      passMarkPercent: pass_mark_percent,
      timeLimitMinutes: time_limit_minutes,
      shuffle,
      maxAttempts: max_attempts,
      cooldownMinutes: cooldown_minutes,
    })
    .run();

  return res.status(201).json({ success: true });
});

export default router;
