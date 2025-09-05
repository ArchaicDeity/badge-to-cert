import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, assessmentId, type, body, choices, correctIndex, correctBool, explanation, tags } = req.body as {
    id: number;
    assessmentId?: number;
    type?: 'MCQ' | 'TF';
    body?: string;
    choices?: string[];
    correctIndex?: number;
    correctBool?: boolean;
    explanation?: string;
    tags?: string;
  };

  if (!id) {
    res.status(400).json({ error: 'Missing question id' });
    return;
  }

  try {
    const [question] = await db
      .update(questions)
      .set({
        assessmentId,
        type,
        body,
        choicesJson: choices ? JSON.stringify(choices) : undefined,
        correctIndex,
        correctBool,
        explanation,
        tags,
      })
      .where(eq(questions.id, id))
      .returning();

    res.status(200).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update question' });
  }
}
