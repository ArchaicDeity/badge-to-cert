import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import type { Question } from '@/lib/mockData';

interface QuestionsResponse {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
}

const AssessmentQuestions = () => {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery<QuestionsResponse>({
    queryKey: ['questions', id, page, search, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '10');
      if (search) params.set('search', search);
      if (type) params.set('type', type);
      const res = await fetch(`/api/assessments/${id}/questions?${params.toString()}`);
      return res.json();
    },
  });

  const questions = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 10;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button>New Question</Button>
          <Button variant="outline">Bulk Import</Button>
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={value => { setType(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search text or tag..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map(q => (
            <TableRow key={q.id}>
              <TableCell>{q.body}</TableCell>
              <TableCell>{q.tags.join(', ')}</TableCell>
              <TableCell>{q.type}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => console.log('Edit', q.id)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => console.log('Duplicate', q.id)}>Duplicate</Button>
                <Button variant="ghost" size="sm" onClick={() => console.log('Delete', q.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {Math.ceil(total / pageSize) || 1}
        </span>
        <Button
          variant="outline"
          disabled={page * pageSize >= total}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AssessmentQuestions;
