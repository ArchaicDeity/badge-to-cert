import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ContentEditorProps {
  blockId: number;
}

export function ContentEditor({ blockId }: ContentEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('blockId', String(blockId));
    formData.append('file', file);
    await fetch('/api/content/upload', {
      method: 'POST',
      body: formData,
    });
  };

  const saveHtml = async () => {
    await fetch('/api/content/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId, contentType: 'HTML', htmlBody: html }),
    });
  };

  const saveUrl = async () => {
    await fetch('/api/content/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId, contentType: 'URL', sourcePath: url }),
    });
  };

  return (
    <Tabs defaultValue="file">
      <TabsList>
        <TabsTrigger value="file">Upload PDF</TabsTrigger>
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="url">External URL</TabsTrigger>
      </TabsList>
      <TabsContent value="file" className="space-y-2">
        <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <Button onClick={uploadFile}>Upload</Button>
      </TabsContent>
      <TabsContent value="html" className="space-y-2">
        <Textarea value={html} onChange={e => setHtml(e.target.value)} placeholder="Enter HTML here" />
        <Button onClick={saveHtml}>Save</Button>
      </TabsContent>
      <TabsContent value="url" className="space-y-2">
        <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
        <Button onClick={saveUrl}>Save</Button>
      </TabsContent>
    </Tabs>
  );
}
