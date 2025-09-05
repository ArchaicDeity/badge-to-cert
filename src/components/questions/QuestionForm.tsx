import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export type QuestionInput = {
  type: 'MCQ' | 'TF';
  body: string;
  choices?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  explanation?: string;
  tags?: string;
};

interface QuestionFormProps {
  initialData?: QuestionInput;
  onSave: (data: QuestionInput) => void;
  onCancel: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ initialData, onSave, onCancel }) => {
  const [type, setType] = useState<QuestionInput['type']>(initialData?.type || 'MCQ');
  const [body, setBody] = useState(initialData?.body || '');
  const [choices, setChoices] = useState<string[]>(initialData?.choices || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(initialData?.correctIndex ?? 0);
  const [correctBool, setCorrectBool] = useState(initialData?.correctBool ?? true);

  const handleChoiceChange = (value: string, index: number) => {
    const copy = [...choices];
    copy[index] = value;
    setChoices(copy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: QuestionInput = { type, body };
    if (type === 'MCQ') {
      payload.choices = choices;
      payload.correctIndex = correctIndex;
    } else {
      payload.correctBool = correctBool;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={(v: 'MCQ' | 'TF') => setType(v)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MCQ">Multiple Choice</SelectItem>
            <SelectItem value="TF">True / False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="body">Question</Label>
        <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      {type === 'MCQ' && (
        <div className="space-y-2">
          {choices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={choice}
                placeholder={`Choice ${idx + 1}`}
                onChange={(e) => handleChoiceChange(e.target.value, idx)}
              />
              <input
                type="radio"
                className="h-4 w-4"
                checked={correctIndex === idx}
                onChange={() => setCorrectIndex(idx)}
              />
            </div>
          ))}
        </div>
      )}
      {type === 'TF' && (
        <div>
          <Label htmlFor="correctBool">Correct Answer</Label>
          <Select
            value={correctBool ? 'true' : 'false'}
            onValueChange={(v) => setCorrectBool(v === 'true')}
          >
            <SelectTrigger id="correctBool">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
