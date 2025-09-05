import express from "express";
import formidable from "formidable";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("data/database.sqlite");
db.exec(`CREATE TABLE IF NOT EXISTS content_units (
  id TEXT PRIMARY KEY,
  block_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  html_body TEXT,
  url TEXT,
  file_path TEXT
)`);

const router = express.Router();

router.post("/", (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: "Invalid form data" });
      return;
    }
    const blockId = Array.isArray(fields.blockId) ? fields.blockId[0] : fields.blockId;
    const content_type = Array.isArray(fields.content_type) ? fields.content_type[0] : fields.content_type;
    const html_body = Array.isArray(fields.html_body) ? fields.html_body[0] : fields.html_body;
    const url = Array.isArray(fields.url) ? fields.url[0] : fields.url;
    let file_path: string | null = null;

    if (!blockId || !content_type) {
      res.status(400).json({ error: "blockId and content_type are required" });
      return;
    }

    if (content_type === "pdf") {
      const file = files.file;
      if (!file || Array.isArray(file)) {
        res.status(400).json({ error: "PDF file is required" });
        return;
      }
      const uuid = randomUUID();
      const uploadDir = path.join("data", "uploads", "content");
      fs.mkdirSync(uploadDir, { recursive: true });
      file_path = path.join(uploadDir, `${uuid}.pdf`);
      fs.copyFileSync(file.filepath, file_path);
    }

    const id = randomUUID();
    db.prepare(
      "INSERT INTO content_units (id, block_id, content_type, html_body, url, file_path) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, blockId, content_type, html_body ?? null, url ?? null, file_path);

    res.json({ id, blockId, content_type, html_body, url, file_path });
  });
});

export default router;
