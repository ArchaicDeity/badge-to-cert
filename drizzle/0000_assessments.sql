CREATE TABLE IF NOT EXISTS "assessments" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "block_id" integer NOT NULL,
  "num_questions" integer NOT NULL,
  "pass_mark_percent" integer NOT NULL,
  "time_limit_minutes" integer NOT NULL,
  "shuffle" integer NOT NULL DEFAULT 0,
  "max_attempts" integer,
  "cooldown_minutes" integer,
  CONSTRAINT "assessments_block_id_unique" UNIQUE("block_id")
);
