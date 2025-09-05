import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assessmentId: text('assessment_id').notNull(),
  body: text('body').notNull(),
  choices: text('choices', { mode: 'json' }).notNull(),
  correctIndex: integer('correct_index').notNull(),
  tags: text('tags', { mode: 'json' }).notNull(),
});
