import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const enterprises = sqliteTable('enterprises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  brandLogoPath: text('brand_logo_path'),
  brandPrimaryColor: text('brand_primary_color'),
  brandSecondaryColor: text('brand_secondary_color'),
  brandLoginMessage: text('brand_login_message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  code: text('code'),
  description: text('description'),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('DRAFT'),
  enterpriseId: integer('enterprise_id').references(() => enterprises.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const courseBlocks = sqliteTable('course_blocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull().references(() => courses.id),
  kind: text('kind', { enum: ['CONTENT', 'ASSESSMENT'] }).notNull(),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  isMandatory: integer('is_mandatory', { mode: 'boolean' }).notNull().default(1),
  configJson: text('config_json'),
});

export const contentUnits = sqliteTable('content_units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blockId: integer('block_id').notNull().references(() => courseBlocks.id),
  contentType: text('content_type').notNull(),
  sourcePath: text('source_path'),
  htmlBody: text('html_body'),
  durationMinutes: integer('duration_minutes'),
});

export const assessments = sqliteTable('assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blockId: integer('block_id').notNull().references(() => courseBlocks.id),
  timeLimitMinutes: integer('time_limit_minutes'),
  numQuestions: integer('num_questions').notNull(),
  passMarkPercent: integer('pass_mark_percent').notNull(),
  retakeCooldownMinutes: integer('retake_cooldown_minutes').default(10),
  maxAttempts: integer('max_attempts').default(2),
  shuffleQuestions: integer('shuffle_questions', { mode: 'boolean' }).default(1),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assessmentId: integer('assessment_id').notNull().references(() => assessments.id),
  type: text('type', { enum: ['MCQ', 'TF'] }).notNull(),
  body: text('body').notNull(),
  choicesJson: text('choices_json'),
  correctIndex: integer('correct_index'),
  correctBool: integer('correct_bool', { mode: 'boolean' }),
  explanation: text('explanation'),
  tags: text('tags'),
});

export const reviewRequests = sqliteTable('review_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull().references(() => courses.id),
  enterpriseId: integer('enterprise_id').references(() => enterprises.id),
  status: text('status').notNull().default('OPEN'),
  submittedBy: integer('submitted_by'),
  reviewedBy: integer('reviewed_by'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: text('reviewed_at'),
});

export const enrollmentProgress = sqliteTable('enrollment_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  enrollmentId: integer('enrollment_id').notNull(),
  blockId: integer('block_id').notNull().references(() => courseBlocks.id),
  status: text('status').notNull().default('NOT_STARTED'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  score: integer('score'),
  attempts: integer('attempts').default(0),
}, (table) => ({
  enrollmentBlockUnique: uniqueIndex('enrollment_block_unique').on(table.enrollmentId, table.blockId),
}));
