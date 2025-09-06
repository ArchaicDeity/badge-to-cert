import { describe, it, expect } from 'vitest';
import { addBlock, reorderBlocks } from '@/api/block';

describe('Block operations and reorder logic', () => {
  it('adds a block to a course', async () => {
    const course = await addBlock('course1', { id: 'block1', title: 'Start', contents: [] });
    expect(course.blocks[0].title).toBe('Start');
  });

  it('reorders blocks by given order', async () => {
    const course = await reorderBlocks('course1', ['block2', 'block1']);
    expect(course.blocks.map((b: any) => b.id)).toEqual(['block2', 'block1']);
  });
});
