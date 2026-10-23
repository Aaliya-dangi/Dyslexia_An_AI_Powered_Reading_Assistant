import express from 'express';
import multer from 'multer';
import { uploadDocument } from '../services/document.service.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

router.post('/upload', upload.single('file'), uploadDocument);

export default router;