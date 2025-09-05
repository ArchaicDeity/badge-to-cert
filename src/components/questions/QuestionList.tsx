import { Button } from '@/components/ui/button';
import type { QuestionInput } from './QuestionForm';

export interface Question extends QuestionInput {
  id: number;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question, index: number) => void;
  onDelete: (id: number) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onEdit, onDelete }) => {
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions added.</p>;
  }

  return (
    <div className="space-y-2">
      {questions.map((q, index) => (
        <div key={q.id} className="flex items-start justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{q.body}</p>
            <p className="text-xs text-muted-foreground">{q.type}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(q, index)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(q.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
