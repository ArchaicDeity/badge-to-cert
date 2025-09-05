import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { questions } from '@/db/schema';

interface BulkQuestion {
  type: 'MCQ' | 'TF';
  body: string;
  choices?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  explanation?: string;
  tags?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { assessmentId, items } = req.body as {
    assessmentId: number;
    items: BulkQuestion[];
  };

  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Invalid items array' });
    return;
  }

  try {
    await db.insert(questions).values(
      items.map((q) => ({
        assessmentId,
        type: q.type,
        body: q.body,
        choicesJson: q.choices ? JSON.stringify(q.choices) : null,
        correctIndex: q.correctIndex,
        correctBool: q.correctBool,
        explanation: q.explanation,
        tags: q.tags,
      }))
    );
    res.status(200).json({ success: true, count: items.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import questions' });
  }
}
