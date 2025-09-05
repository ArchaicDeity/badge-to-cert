import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const questionTypes = ["MCQ", "TF"] as const;

export const questions = sqliteTable(
  "questions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assessmentId: integer("assessment_id").notNull(),
    type: text("type", { enum: questionTypes }).notNull(),
    body: text("body").notNull(),
    choicesJson: text("choices_json", { mode: "json" }).$type<string[] | null>(),
    correctIndex: integer("correct_index"),
    correctBool: integer("correct_bool", { mode: "boolean" }),
    explanation: text("explanation"),
    tags: text("tags"),
  },
  (t) => ({
    mcqChoices: sql`CHECK (${t.type} != 'MCQ' OR ${t.choicesJson} IS NOT NULL)`,
    mcqCorrectIndex: sql`CHECK (${t.type} != 'MCQ' OR ${t.correctIndex} IS NOT NULL)`,
    tfCorrectBool: sql`CHECK (${t.type} != 'TF' OR ${t.correctBool} IS NOT NULL)`,
  })
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
