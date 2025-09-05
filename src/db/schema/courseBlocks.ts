
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courseBlocks = sqliteTable("course_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
});

import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { courses } from './courses';

export const courseBlocks = sqliteTable(
  'course_blocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    courseId: integer('course_id').notNull().references(() => courses.id),
    kind: text('kind', { enum: ['CONTENT', 'ASSESSMENT'] }).notNull(),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    isMandatory: integer('is_mandatory', { mode: 'boolean' }).notNull().default(1),
    configJson: text('config_json'),
  },
  (table) => ({
    coursePositionUnique: uniqueIndex('course_position_unique').on(table.courseId, table.position),
  })
);

