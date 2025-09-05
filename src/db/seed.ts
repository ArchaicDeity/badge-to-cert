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
