import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courseBlocks = sqliteTable("course_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
});
