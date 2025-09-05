import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database (in memory if no path provided)
const sqlite = new Database(process.env.DATABASE_PATH || ':memory:');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
