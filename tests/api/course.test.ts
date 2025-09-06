import { describe, it, expect } from 'vitest';
import { createCourse, publishCourse } from '@/api/course';

describe('Course creation and publishing', () => {
  it('requires a title when creating a course', async () => {
    await expect(createCourse({ description: 'Desc only' })).rejects.toThrow(/title/i);
  });

  it('publishes a valid course', async () => {
    const course = await createCourse({ title: 'Intro', description: 'Basics' });
    const published = await publishCourse(course.id);
    expect(published.published).toBe(true);
  });
});
