import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  code: text("code"),
  description: text("description"),
  status: text("status").notNull(),
});
