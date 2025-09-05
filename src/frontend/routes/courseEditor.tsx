import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Course = Record<string, unknown>;
type Block = Record<string, unknown>;

const CourseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, blocksRes] = await Promise.all([
          fetch(`/api/courses/${id}`),
          fetch(`/api/courses/${id}/blocks`),
        ]);
        setCourse(await courseRes.json());
        setBlocks(await blocksRes.json());
      } catch (error) {
        console.error('Failed to fetch course data', error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">Blocks Palette</div>
      <div className="flex-1 p-4 border-r">Ladder</div>
      <div className="w-1/4 p-4">Inspector</div>
    </div>
  );
};

export default CourseEditor;

