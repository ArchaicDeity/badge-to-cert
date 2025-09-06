import { describe, it, expect } from 'vitest';
import { createContent, updateContent, deleteContent } from '@/api/content';
import { createAssessment, updateAssessment, deleteAssessment } from '@/api/assessment';

describe('Content and assessment CRUD', () => {
  it('handles content CRUD operations', async () => {
    const content = await createContent('block1', { id: 'content1', type: 'video', data: 'url1' });
    const updated = await updateContent(content.id, { data: 'url2' });
    await deleteContent(updated.id);
    expect(updated.data).toBe('url2');
  });

  it('handles assessment CRUD operations', async () => {
    const assessment = await createAssessment('block1', { id: 'a1', title: 'Q1', questions: [] });
    const updated = await updateAssessment(assessment.id, { title: 'Q1 updated' });
    await deleteAssessment(updated.id);
    expect(updated.title).toBe('Q1 updated');
  });
});
