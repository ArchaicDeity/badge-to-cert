import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { applyConditionalUpdate, replacePdf } from './fileUtils';

describe('applyConditionalUpdate', () => {
  it('updates only pdf field when content_type is application/pdf', () => {
    const original = { title: 'Old', pdf: 'old.pdf', description: 'Old desc' };
    const result = applyConditionalUpdate(original, {
      content_type: 'application/pdf',
      pdf: 'new.pdf',
      title: 'New',
    });
    expect(result).toEqual({ title: 'Old', pdf: 'new.pdf', description: 'Old desc' });
  });

  it('updates non-pdf fields when content_type is not pdf', () => {
    const original = { title: 'Old', pdf: 'old.pdf', description: 'Old desc' };
    const result = applyConditionalUpdate(original, {
      content_type: 'application/json',
      title: 'New',
      description: 'New desc',
      pdf: 'ignored.pdf',
    });
    expect(result).toEqual({ title: 'New', pdf: 'old.pdf', description: 'New desc' });
  });
});

describe('replacePdf', () => {
  it('deletes old file when replacing', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
    const oldPath = path.join(dir, 'old.pdf');
    await fs.writeFile(oldPath, 'old');

    const newBuffer = Buffer.from('new');
    const filename = await replacePdf('old.pdf', newBuffer, dir);
    const newPath = path.join(dir, filename);

    const data = await fs.readFile(newPath, 'utf8');
    expect(data).toBe('new');

    let oldExists = true;
    try {
      await fs.access(oldPath);
    } catch {
      oldExists = false;
    }
    expect(oldExists).toBe(false);
  });
});
