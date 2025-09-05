import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { courseBlocks } from "./courseBlocks";

export const contentUnits = sqliteTable("content_units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  blockId: integer("block_id")
    .notNull()
    .references(() => courseBlocks.id, { onDelete: "cascade" })
    .unique(),
  contentType: text("content_type").notNull(),
  sourcePath: text("source_path"),
  htmlBody: text("html_body"),
  url: text("url"),
  durationMinutes: integer("duration_minutes"),
});
