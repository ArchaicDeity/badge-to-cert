import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuestionForm, QuestionInput } from '@/components/questions/QuestionForm';
import { QuestionList, Question } from '@/components/questions/QuestionList';

const AssessmentQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ index: number; data: Question } | null>(null);

  const handleSave = (data: QuestionInput) => {
    if (editing) {
      setQuestions((prev) =>
        prev.map((q, i) => (i === editing.index ? { ...q, ...data } : q))
      );
    } else {
      const newQuestion: Question = { id: Date.now(), ...data };
      setQuestions((prev) => [...prev, newQuestion]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (question: Question, index: number) => {
    setEditing({ index, data: question });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Assessment Questions</h1>
      {showForm ? (
        <QuestionForm
          initialData={editing?.data}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : (
        <Button onClick={() => setShowForm(true)}>Add Question</Button>
      )}
      <QuestionList questions={questions} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default AssessmentQuestions;
