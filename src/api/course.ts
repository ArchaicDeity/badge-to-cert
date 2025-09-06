export interface CourseInput {
  title?: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  published: boolean;
  blocks: any[];
}

export async function createCourse(input: CourseInput): Promise<Course> {
  throw new Error('Not implemented');
}

export async function publishCourse(courseId: string): Promise<Course> {
  throw new Error('Not implemented');
}
