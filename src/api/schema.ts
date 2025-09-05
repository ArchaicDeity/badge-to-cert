
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const courseBlocks = sqliteTable('course_blocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  isMandatory: integer('is_mandatory').default(0).notNull(),
  position: integer('position').notNull(),
});

export type CourseBlock = typeof courseBlocks.$inferSelect;

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  code: text("code"),
  description: text("description"),
  status: text("status").notNull(),
});

