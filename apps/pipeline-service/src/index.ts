import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { pipelineRouter } from './routes/pipeline';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/pipeline', pipelineRouter);
app.use('/', healthRouter);

app.listen(PORT, () => {
  console.log(`📋 Pipeline Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

export default app;
