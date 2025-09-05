import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  text: string;
  choices: string[];
}

interface Issue {
  questionId: number;
  message: string;
}

const Builder = () => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '', choices: ['', ''] },
    { id: 2, text: '', choices: ['', ''] },
  ]);

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].text = value;
      return updated;
    });
  };

  const handleChoiceChange = (qIndex: number, cIndex: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].choices[cIndex] = value;
      return updated;
    });
  };

  const validate = () => {
    const found: Issue[] = [];
    questions.forEach(q => {
      if (!q.text.trim()) {
        found.push({ questionId: q.id, message: 'Question text is required' });
      }
      q.choices.forEach((c, idx) => {
        if (!c.trim()) {
          found.push({ questionId: q.id, message: `Choice ${idx + 1} is empty` });
        }
      });
    });
    setIssues(found);
    setOpen(found.length > 0);
    if (found.length === 0) {
      toast({ title: 'Published successfully' });
    }
  };

  const scrollToQuestion = (id: number) => {
    const index = questions.findIndex(q => q.id === id);
    const el = questionRefs.current[index];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-6 space-y-4">
      {questions.map((q, qi) => (
        <div
          key={q.id}
          ref={el => (questionRefs.current[qi] = el)}
          className="space-y-2 border p-4 rounded-md"
        >
          <Label htmlFor={`question-${q.id}`}>Question {qi + 1}</Label>
          <Input
            id={`question-${q.id}`}
            value={q.text}
            onChange={e => handleQuestionChange(qi, e.target.value)}
            placeholder="Enter question text"
          />
          {q.choices.map((choice, ci) => (
            <Input
              key={ci}
              value={choice}
              onChange={e => handleChoiceChange(qi, ci, e.target.value)}
              placeholder={`Choice ${ci + 1}`}
            />
          ))}
        </div>
      ))}

      <Button onClick={validate}>Publish</Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Publish Issues</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-full">
            <ul className="space-y-2">
              {issues.map((issue, idx) => (
                <li key={idx}>
                  <button
                    className="text-left text-destructive underline"
                    onClick={() => scrollToQuestion(issue.questionId)}
                  >
                    Q{issue.questionId}: {issue.message}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Builder;

