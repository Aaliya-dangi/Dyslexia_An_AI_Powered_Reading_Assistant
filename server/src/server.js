import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (MongoDB or memory fallback)
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'Dyslexia-Friendly Reading Assistant API is active.',
    endpoints: {
      health: '/api/health',
      submitText: 'POST /api/documents/text',
      uploadDocument: 'POST /api/documents/upload',
      listDocuments: 'GET /api/documents',
      getDocument: 'GET /api/documents/:id',
      simplify: 'POST /api/documents/:id/simplify',
      visualize: 'POST /api/documents/:id/visualize',
      speechTTS: 'POST /api/speech/tts',
      speechSTT: 'POST /api/speech/stt',
      sessionEvents: 'POST /api/sessions/:documentId/event'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Dyslexia Reading Assistant Server is running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
