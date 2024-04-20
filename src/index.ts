import express, { Application, Request, Response } from 'express';
import router from './routes/router';

const app: Application = express();
const port: number = 3000;

app.use(express.json());

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});