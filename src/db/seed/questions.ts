import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { questions } from "../schema/questions";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

const seedQuestions = [
  {
    assessmentId: 1,
    type: "MCQ",
    body: "What is 2 + 2?",
    choicesJson: ["3", "4", "5", "6"],
    correctIndex: 1,
    explanation: "2 + 2 equals 4.",
    tags: "math,arithmetic",
  },
  {
    assessmentId: 1,
    type: "MCQ",
    body: "What color is the sky on a clear day?",
    choicesJson: ["Blue", "Green", "Red", "Yellow"],
    correctIndex: 0,
    explanation: "The sky appears blue due to the scattering of sunlight.",
    tags: "science",
  },
  {
    assessmentId: 2,
    type: "TF",
    body: "The Earth is flat.",
    correctBool: false,
    explanation: "The Earth is roughly spherical.",
    tags: "geography",
  },
  {
    assessmentId: 2,
    type: "TF",
    body: "JavaScript is a programming language.",
    correctBool: true,
    explanation: "JavaScript is used to build web applications.",
    tags: "technology",
  },
];

db.insert(questions).values(seedQuestions).run();

console.log("Seeded questions");
