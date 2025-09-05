import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ladder, type Block } from '@/components/Ladder';

const CourseEditor = () => {
  const { courseId } = useParams();
  const id = Number(courseId);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const fetchBlocks = useCallback(async () => {
    const res = await fetch(`/api/kiosk/course/${id}`);
    if (res.ok) {
      const data: { blocks: Block[] } = await res.json();
      setBlocks(data.blocks ?? []);
    }
  }, [id]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return (
    <div className="p-4">
      <Ladder courseId={id} initialBlocks={blocks} onBlocksChange={fetchBlocks} />
    </div>
  );
};

export default CourseEditor;

