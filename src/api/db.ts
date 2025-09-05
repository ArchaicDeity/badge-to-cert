import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Initialize SQLite database. In a real application this
// would likely be an external file rather than in-memory.
const sqlite = new Database('sqlite.db');

export const db = drizzle(sqlite);
