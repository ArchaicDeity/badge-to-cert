import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const blocks = sqliteTable('blocks', {
  id: integer('id').primaryKey(),
  courseId: integer('course_id').notNull(),
  position: integer('position').notNull(),
});
