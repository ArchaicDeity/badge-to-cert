import { sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  blockId: integer("block_id").notNull().unique(),
  numQuestions: integer("num_questions").notNull(),
  passMarkPercent: integer("pass_mark_percent").notNull(),
  timeLimitMinutes: integer("time_limit_minutes").notNull(),
  shuffle: integer("shuffle", { mode: "boolean" }).notNull().default(false),
  maxAttempts: integer("max_attempts"),
  cooldownMinutes: integer("cooldown_minutes"),
});
