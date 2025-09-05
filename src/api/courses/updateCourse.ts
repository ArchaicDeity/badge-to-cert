import type { Request, Response } from 'express';
import { z } from 'zod';

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

// Temporary in-memory store. Replace with database integration.
const courses: Record<string, Course> = {};

const updateCourseSchema = z.object({
  title: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
});

export function updateCourse(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateCourseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const course = courses[id];
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  if (course.status === 'PUBLISHED') {
    return res
      .status(400)
      .json({ error: 'Published courses cannot be edited' });
  }

  Object.assign(course, parsed.data);
  return res.json(course);
}

export default updateCourse;
