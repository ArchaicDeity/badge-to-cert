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

