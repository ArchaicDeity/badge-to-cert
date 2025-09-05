import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Ladder, type Block } from '@/components/Ladder';

const sampleBlocks: Block[] = [
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Lesson' },
  { id: 3, title: 'Assessment' },
];

const CourseEditor = () => {
  const { courseId } = useParams();
  const id = Number(courseId);
  const [review, setReview] = useState<{ id: number; status: string; notes?: string } | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/courses/${id}/review`)
      .then((res) => res.json())
      .then((data) => setReview(data.review))
      .catch(() => {});
  }, [id]);

  const requestReview = async () => {
    const res = await fetch(`/api/courses/${id}/review`, { method: 'POST' });
    const data = await res.json();
    setReview(data.review);
  };

  const approve = async () => {
    await fetch(`/api/reviews/${review.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setReview({ ...review, status: 'APPROVED', notes });
  };

  const reject = async () => {
    await fetch(`/api/reviews/${review.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setReview({ ...review, status: 'REJECTED', notes });
  };

  return (
    <div className="p-4 space-y-4">
      <Ladder courseId={id} initialBlocks={sampleBlocks} />
      {!review || review.status !== 'OPEN' ? (
        <Button onClick={requestReview}>Request Review</Button>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reviewer notes"
          />
          <div className="flex gap-2">
            <Button onClick={approve}>Approve</Button>
            <Button variant="destructive" onClick={reject}>
              Reject
            </Button>
          </div>
        </div>
      )}
      {review && review.status !== 'OPEN' && (
        <div className="border rounded p-3">
          <p className="font-medium">Review Status: {review.status}</p>
          {review.notes && (
            <p className="text-sm text-muted-foreground">Notes: {review.notes}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
