import express from 'express';
import { reorderBlocksRouter } from './routes/reorderBlocks';

const app = express();
app.use(express.json());
app.use('/blocks/reorder', reorderBlocksRouter);

export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
