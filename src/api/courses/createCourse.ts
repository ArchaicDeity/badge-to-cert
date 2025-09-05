import { Request, Response } from "express";
import { db } from "../db";
import { courses } from "../schema";

interface CourseInput {
  title: string;
  code?: string;
  description?: string;
}

export async function createCourse(req: Request, res: Response) {
  const { title, code, description } = req.body as CourseInput;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const [course] = await db
    .insert(courses)
    .values({
      title,
      code: code ?? null,
      description: description ?? null,
      status: "DRAFT",
    })
    .returning();

  res.json(course);
}
