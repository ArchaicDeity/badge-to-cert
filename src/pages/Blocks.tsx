import { useState, useRef } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';

interface Block {
  id: string;
  title: string;
}

const SortableItem = ({ id, title }: Block) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded p-2 mb-2 bg-card"
    >
      {title}
    </div>
  );
};

const Blocks = () => {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', title: 'Block 1' },
    { id: '2', title: 'Block 2' },
    { id: '3', title: 'Block 3' }
  ]);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const saveOrder = async (newBlocks: Block[]) => {
    try {
      const res = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newBlocks.map(b => b.id) })
      });
      if (!res.ok) throw new Error('Request failed');
      toast({ title: 'Order saved' });
    } catch (err) {
      toast({ title: 'Failed to save order', variant: 'destructive' });
    }
  };

  const saveOrderDebounced = (newBlocks: Block[]) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => saveOrder(newBlocks), 500);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(newBlocks);
    saveOrderDebounced(newBlocks);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blocks</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          {blocks.map(block => (
            <SortableItem key={block.id} id={block.id} title={block.title} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Blocks;
