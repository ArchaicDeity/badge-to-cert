import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const blocks = sqliteTable('blocks', {
  id: integer('id').primaryKey(),
  type: text('type').notNull(),
});

export const assessments = sqliteTable('assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blockId: integer('block_id').notNull().references(() => blocks.id),
  numQuestions: integer('num_questions').notNull(),
  passMarkPercent: integer('pass_mark_percent').notNull(),
  timeLimitMinutes: integer('time_limit_minutes'),
  shuffle: integer('shuffle', { mode: 'boolean' }),
  maxAttempts: integer('max_attempts'),
  cooldownMinutes: integer('cooldown_minutes'),
});
