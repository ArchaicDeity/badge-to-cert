/* @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import { mockCohorts } from '@/lib/mockData';

function CourseList({ courses }: { courses: typeof mockCohorts }) {
  return (
    <ul>
      {courses.map((c) => (
        <li key={c.id}>{c.venue}</li>
      ))}
    </ul>
  );
}

describe('CourseList', () => {
  it('renders provided courses', () => {
    render(<CourseList courses={mockCohorts} />);
    mockCohorts.forEach((c) => {
      expect(screen.getByText(c.venue)).toBeInTheDocument();
    });
  });
});
