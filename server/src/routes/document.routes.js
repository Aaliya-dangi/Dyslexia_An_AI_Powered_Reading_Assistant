import express from 'express';
import multer from 'multer';
import {
  submitTextDocument,
  uploadDocument,
  reSimplifyDocument
} from '../services/document.service.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

router.post('/text', submitTextDocument);
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/simplify', reSimplifyDocument);

export default router;
