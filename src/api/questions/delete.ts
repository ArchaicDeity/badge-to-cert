import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.body as { id: number };

  if (!id) {
    res.status(400).json({ error: 'Missing question id' });
    return;
  }

  try {
    await db.delete(questions).where(eq(questions.id, id));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
}
