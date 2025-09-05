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
