
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { courseBlocks } from "./schema/courseBlocks";
import { contentUnits } from "./schema/contentUnits";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

async function seed() {
  await db.insert(courseBlocks).values([
    { title: "PDF Content" },
    { title: "HTML Content" },
    { title: "Link Content" },
  ]);

  await db.insert(contentUnits).values([
    {
      blockId: 1,
      contentType: "pdf",
      sourcePath: "/files/example.pdf",
      durationMinutes: 10,
    },
    {
      blockId: 2,
      contentType: "html",
      htmlBody: "<p>Example HTML content.</p>",
      durationMinutes: 5,
    },
    {
      blockId: 3,
      contentType: "link",
      url: "https://example.com",
      durationMinutes: 3,
    },
  ]);
}

seed().then(() => {
  console.log("Seeded content units");
});

import { db } from './index';
import { courses } from './schema/courses';
import { courseBlocks } from './schema/courseBlocks';

async function seed() {
  await db.insert(courses).values({
    id: 1,
    title: 'Demo Course',
    code: 'DEMO',
    description: 'Demo course for seed',
  });

  await db.insert(courseBlocks).values([
    {
      courseId: 1,
      kind: 'CONTENT',
      title: 'Introduction',
      position: 1,
      isMandatory: true,
    },
    {
      courseId: 1,
      kind: 'ASSESSMENT',
      title: 'Intro Quiz',
      position: 2,
      isMandatory: true,
      configJson: JSON.stringify({ questions: 10 }),
    },
  ]);
}

await seed();
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { courses } from './schema/courses';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

await db.insert(courses).values({
  title: 'Sample Course',
  code: 'COURSE101',
  description: 'A sample course for testing.',
});

console.log('Seed data inserted');
