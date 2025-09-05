import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusChip from '@/components/StatusChip';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Draft');
  const [version, setVersion] = useState(1);

  const isValid = title.trim().length > 0;

  const handleSaveDraft = () => {
    setVersion(v => v + 1);
    toast({ title: 'Draft saved' });
  };

  const handlePreview = () => {
    toast({ title: 'Preview opened' });
  };

  const handlePublish = () => {
    setStatus('Published');
    toast({ title: 'Content published' });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePreview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editor</h1>
          <StatusChip status={status} version={version} />
        </div>
        <Input
          placeholder="Enter title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handlePublish} disabled={!isValid}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
