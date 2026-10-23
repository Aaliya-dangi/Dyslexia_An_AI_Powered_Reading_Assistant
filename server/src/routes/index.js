import express from 'express';
import documentRoutes from './document.routes.js';
import authRoutes from './auth.routes.js';
import speechRoutes from './speech.routes.js';
import sessionRoutes from './session.routes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Dyslexia-Friendly Reading Assistant API'
  });
});

// Mount domain routes
router.use('/documents', documentRoutes);
router.use('/auth', authRoutes);
router.use('/speech', speechRoutes);
router.use('/sessions', sessionRoutes);

export default router;
