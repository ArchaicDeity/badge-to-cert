import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '@/db';
import { contentUnits } from '@/db/schema';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = (await form.parse(req)) as [Fields, Files];
    const blockId = parseInt(fields.blockId?.toString() ?? '', 10);
    const durationMinutes = fields.durationMinutes ? parseInt(fields.durationMinutes.toString(), 10) : null;

    const file = (files as Files & { file?: File | File[] }).file;
    if (!blockId || !file) {
      res.status(400).json({ error: 'Missing blockId or file' });
      return;
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const originalName = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
    const tempPath = Array.isArray(file) ? file[0].filepath : file.filepath;
    const filename = `${Date.now()}-${originalName}`;
    const destPath = path.join(uploadDir, filename);
    await fs.promises.rename(tempPath, destPath);

    const relativePath = `/uploads/${filename}`;

    await db.insert(contentUnits).values({
      blockId,
      contentType: 'PDF',
      sourcePath: relativePath,
      durationMinutes: durationMinutes ?? undefined,
    });

    res.status(200).json({ success: true, path: relativePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload content' });
  }
}
