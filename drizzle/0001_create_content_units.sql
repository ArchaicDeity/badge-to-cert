CREATE TABLE IF NOT EXISTS content_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id INTEGER NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  source_path TEXT,
  html_body TEXT,
  url TEXT,
  duration_minutes INTEGER,
  FOREIGN KEY (block_id) REFERENCES course_blocks(id) ON DELETE CASCADE
);
