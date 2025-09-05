import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { questions } from '@/db/schema';
import Papa from 'papaparse';

interface BulkQuestion {
  type: 'MCQ' | 'TF';
  body: string;
  choices?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  explanation?: string;
  tags?: string;
}

function parseCsv(csv: string): BulkQuestion[] {
  const { data } = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row) => ({
    type: row.type as 'MCQ' | 'TF',
    body: row.body,
    choices: row.choices ? row.choices.split('|').map((c) => c.trim()) : undefined,
    correctIndex: row.correctIndex ? Number(row.correctIndex) : undefined,
    correctBool:
      row.correctBool !== undefined && row.correctBool !== ''
        ? row.correctBool.toLowerCase() === 'true'
        : undefined,
    explanation: row.explanation,
    tags: row.tags,
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const contentType = req.headers['content-type'] || '';
  let assessmentId: number | undefined;
  let items: BulkQuestion[] | undefined;

  try {
    if (contentType.includes('text/csv')) {
      if (typeof req.body !== 'string') {
        res.status(400).json({ error: 'Expected CSV string body' });
        return;
      }
      assessmentId = Number(req.query.assessmentId);
      if (!assessmentId) {
        res.status(400).json({ error: 'Missing assessmentId' });
        return;
      }
      items = parseCsv(req.body);
    } else {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : (req.body as {
              assessmentId: number;
              items?: BulkQuestion[];
              csv?: string;
            });
      assessmentId = body.assessmentId;
      if (Array.isArray(body.items)) {
        items = body.items;
      } else if (typeof body.csv === 'string') {
        items = parseCsv(body.csv);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid request format' });
    return;
  }

  if (!assessmentId || !Array.isArray(items)) {
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
