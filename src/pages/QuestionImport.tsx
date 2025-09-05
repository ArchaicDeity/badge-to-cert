import { useState } from 'react';
import Papa from 'papaparse';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface ImportedQuestion {
  body: string;
  choices: string[];
  correctIndex: number;
  tags: string[];
}

interface PreviewRow {
  question: ImportedQuestion;
  errors: string[];
}

const validateQuestion = (q: ImportedQuestion): string[] => {
  const errors: string[] = [];
  if (!q.body) errors.push('Body required');
  if (!Array.isArray(q.choices) || q.choices.length < 2) errors.push('At least two choices');
  if (
    typeof q.correctIndex !== 'number' ||
    isNaN(q.correctIndex) ||
    q.correctIndex < 0 ||
    q.correctIndex >= q.choices.length
  ) {
    errors.push('Invalid correct index');
  }
  return errors;
};

const QuestionImport = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('csv');
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [parseError, setParseError] = useState('');

  const reset = () => {
    setInput('');
    setPreview([]);
    setParseError('');
  };

  const handleValidate = () => {
    setParseError('');
    try {
      let rows: PreviewRow[] = [];
      if (tab === 'csv') {
        const result = Papa.parse<Record<string, string>>(input, {
          header: true,
          skipEmptyLines: true,
        });
        if (result.errors.length) {
          setParseError(result.errors[0].message);
          setPreview([]);
          return;
        }
        rows = result.data.map((row) => {
          const choices = [row.choice1, row.choice2, row.choice3, row.choice4]
            .filter((c): c is string => !!c && c.trim() !== '');
          const correctIndex = parseInt(row.correctIndex ?? '', 10);
          const tags = row.tags
            ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [];
          const q: ImportedQuestion = {
            body: row.body?.trim() ?? '',
            choices,
            correctIndex,
            tags,
          };
          return { question: q, errors: validateQuestion(q) };
        });
      } else {
        const raw: unknown = JSON.parse(input);
        if (!Array.isArray(raw)) throw new Error('JSON must be an array');
        rows = (raw as unknown[]).map((item) => {
          const obj = item as Record<string, unknown>;
          const q: ImportedQuestion = {
            body: typeof obj.body === 'string' ? obj.body : '',
            choices: Array.isArray(obj.choices)
              ? obj.choices.map((c) => String(c))
              : [],
            correctIndex: Number(obj.correctIndex),
            tags: Array.isArray(obj.tags)
              ? obj.tags.map((t) => String(t))
              : [],
          };
          return { question: q, errors: validateQuestion(q) };
        });
      }
      setPreview(rows);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
      setPreview([]);
    }
  };

  const handleImport = async () => {
    const valid = preview
      .filter((p) => p.errors.length === 0)
      .map((p) => p.question);
    try {
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valid),
      });
      if (!res.ok) throw new Error('Import failed');
      toast({
        title: 'Questions imported',
        description: `${valid.length} questions imported successfully`,
      });
      reset();
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  };

  const hasErrors = preview.some((p) => p.errors.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Import Questions</h1>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          reset();
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="csv">CSV</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="csv">
          <Textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="body,choice1,choice2,choice3,choice4,correctIndex,tags"
          />
        </TabsContent>
        <TabsContent value="json">
          <Textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"body":"Question","choices":["A","B"],"correctIndex":0,"tags":["tag"]}]'
          />
        </TabsContent>
      </Tabs>
      {parseError && <p className="text-destructive my-2">{parseError}</p>}
      <div className="flex gap-2 mt-4">
        <Button onClick={handleValidate}>Validate</Button>
        {preview.length > 0 && (
          <Button onClick={handleImport} disabled={hasErrors}>
            Import
          </Button>
        )}
      </div>
      {preview.length > 0 && (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Choices</TableHead>
              <TableHead>Correct</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, idx) => (
              <TableRow
                key={idx}
                className={row.errors.length ? 'bg-destructive/10' : ''}
              >
                <TableCell className="font-medium">
                  {row.question.body}
                </TableCell>
                <TableCell>
                  <ul className="list-disc pl-4">
                    {row.question.choices.map((c, i) => (
                      <li
                        key={i}
                        className={
                          i === row.question.correctIndex ? 'font-semibold' : ''
                        }
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  {row.question.choices[row.question.correctIndex] ?? ''}
                </TableCell>
                <TableCell>{row.question.tags.join(', ')}</TableCell>
                <TableCell className="text-destructive">
                  {row.errors.join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default QuestionImport;
