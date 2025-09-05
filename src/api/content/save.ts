import type { Request, Response } from 'express';
import { db } from '@/db';
import { contentUnits } from '@/db/schema';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { blockId, contentType, sourcePath, htmlBody, durationMinutes } = req.body as {
    blockId?: number;
    contentType?: string;
    sourcePath?: string;
    htmlBody?: string;
    durationMinutes?: number;
  };

  if (!blockId || !contentType) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    await db.insert(contentUnits).values({
      blockId,
      contentType,
      sourcePath,
      htmlBody,
      durationMinutes,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save content' });
  }
}
