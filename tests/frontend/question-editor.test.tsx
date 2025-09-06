/* @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  question: z.string().min(1, 'Question text is required'),
  answer: z.string().min(1, 'Answer is required'),
});

function QuestionEditor({ onSave }: { onSave: (data: any) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <input placeholder="Question" {...register('question')} />
      {errors.question && <span role="alert">{errors.question.message as string}</span>}
      <input placeholder="Answer" {...register('answer')} />
      {errors.answer && <span role="alert">{errors.answer.message as string}</span>}
      <button type="submit">Save</button>
    </form>
  );
}

describe('QuestionEditor', () => {
  it('validates required fields', async () => {
    const onSave = vi.fn();
    render(<QuestionEditor onSave={onSave} />);
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('Question text is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
