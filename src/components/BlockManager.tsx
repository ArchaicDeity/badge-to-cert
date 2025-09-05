import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Copy, MoreVertical, Trash } from 'lucide-react';

interface Block {
  id: string;
  title: string;
  mandatory: boolean;
  content: string;
  questions: string[];
}

const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timeout: number;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  };
};

export const BlockManager = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: '1',
      title: 'Introduction',
      mandatory: true,
      content: 'Overview of the course and safety procedures.',
      questions: ['What is the purpose of this training?'],
    },
    {
      id: '2',
      title: 'CPR Basics',
      mandatory: false,
      content: 'Fundamentals of performing CPR correctly.',
      questions: ['How deep should chest compressions be?'],
    },
  ]);

  const [selected, setSelected] = useState<Block | null>(null);

  const patchBlock = useCallback(async (id: string, data: Partial<Block>) => {
    try {
      await fetch(`/api/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Failed to patch block', err);
    }
  }, []);

  const debouncedPatchTitle = useMemo(
    () =>
      debounce((id: string, title: string) => {
        patchBlock(id, { title });
      }, 500),
    [patchBlock]
  );

  const handleTitleChange = (id: string, title: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, title } : b)));
    debouncedPatchTitle(id, title);
  };

  const handleMandatoryChange = (id: string, mandatory: boolean) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, mandatory } : b)));
    patchBlock(id, { mandatory });
  };

  const handleDuplicate = (block: Block) => {
    const copy: Block = {
      ...block,
      id: Date.now().toString(),
      title: `${block.title} Copy`,
    };
    setBlocks(prev => [...prev, copy]);
  };

  const handleDelete = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-2">
        {blocks.map(block => (
          <div
            key={block.id}
            className="flex items-center gap-2 border rounded-md p-2"
          >
            <Input
              value={block.title}
              onChange={e => handleTitleChange(block.id, e.target.value)}
              className="flex-1"
            />
            <Switch
              checked={block.mandatory}
              onCheckedChange={checked =>
                handleMandatoryChange(block.id, checked)
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(block)}
            >
              Open
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDuplicate(block)}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(block.id)}>
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <div className="w-1/3 border rounded-md p-4">
        {selected ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{selected.title}</h3>
            <p className="text-sm text-muted-foreground">{selected.content}</p>
            <ul className="list-disc pl-4 text-sm space-y-1">
              {selected.questions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a block to view details
          </p>
        )}
      </div>
    </div>
  );
};

export default BlockManager;

