import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/document.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'LexiRead Stage 2 API is active.',
    endpoints: {
      health: 'GET /api/health',
      upload: 'POST /api/documents/upload'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    stage: 2,
    service: 'LexiRead OCR + Simplification API'
  });
});

app.use('/api/documents', documentRoutes);

app.use((err, _req, res, _next) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(` LexiRead Stage 2 API: http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log('==============================================');
});