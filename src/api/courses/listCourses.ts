import { db } from "../db";
import { courses } from "../db/schema";
import { and, desc, eq, like, or } from "drizzle-orm";

export interface ListCoursesParams {
  q?: string;
  status?: string;
}

export const listCourses = async ({ q, status }: ListCoursesParams = {}) => {
  const conditions = [] as any[];

  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(like(courses.title, term), like(courses.code, term))
    );
  }

  if (status) {
    conditions.push(eq(courses.status, status));
  }

  let query = db.select().from(courses);
  if (conditions.length === 1) {
    query = query.where(conditions[0]);
  } else if (conditions.length > 1) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(desc(courses.createdAt)).all();
};
