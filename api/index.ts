import express from 'express';
import cors from 'cors';
import { mockQuestions } from '../src/lib/mockData';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/assessments/:id/questions', (req, res) => {
  const { page = '1', pageSize = '10', search = '', tag, type } = req.query;
  let questions = mockQuestions;

  if (typeof search === 'string' && search.trim() !== '') {
    const s = search.toLowerCase();
    questions = questions.filter(q =>
      q.body.toLowerCase().includes(s) ||
      q.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  if (typeof tag === 'string' && tag) {
    questions = questions.filter(q => q.tags.includes(tag));
  }

  if (typeof type === 'string' && type) {
    questions = questions.filter(q => q.type === type);
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const sizeNum = parseInt(pageSize as string, 10) || 10;
  const start = (pageNum - 1) * sizeNum;
  const paged = questions.slice(start, start + sizeNum);

  res.json({
    data: paged,
    total: questions.length,
    page: pageNum,
    pageSize: sizeNum
  });
});

export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}
