import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { questions } from '@/db/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { assessmentId, type, body, choices, correctIndex, correctBool, explanation, tags } = req.body as {
    assessmentId: number;
    type: 'MCQ' | 'TF';
    body: string;
    choices?: string[];
    correctIndex?: number;
    correctBool?: boolean;
    explanation?: string;
    tags?: string;
  };

  try {
    const [question] = await db
      .insert(questions)
      .values({
        assessmentId,
        type,
        body,
        choicesJson: choices ? JSON.stringify(choices) : null,
        correctIndex,
        correctBool,
        explanation,
        tags,
      })
      .returning();

    res.status(200).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create question' });
  }
}
