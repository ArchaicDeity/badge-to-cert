import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  code: text('code'),
  description: text('description'),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('DRAFT'),
  enterpriseId: integer('enterprise_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
