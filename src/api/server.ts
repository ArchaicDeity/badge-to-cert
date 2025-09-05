import express from 'express';
import assessments from './assessments';

const app = express();
app.use(express.json());
app.use('/assessments', assessments);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
