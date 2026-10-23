import express from 'express';
import multer from 'multer';
import {
  submitTextDocument,
  uploadDocument,
  getDocumentById,
  reSimplifyDocument,
  listDocuments,
  visualizeDocument
} from '../controllers/document.controller.js';

const router = express.Router();

// Configure multer for in-memory file uploads (max 15MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// POST /api/documents/text - Submit pasted or typed text
router.post('/text', submitTextDocument);

// POST /api/documents/upload - Upload Image or PDF file
router.post('/upload', upload.single('file'), uploadDocument);

// GET /api/documents - List recent documents
router.get('/', listDocuments);

// GET /api/documents/:id - Get specific document
router.get('/:id', getDocumentById);

// POST /api/documents/:id/simplify - Re-run simplification with new level
router.post('/:id/simplify', reSimplifyDocument);

// POST /api/documents/:id/visualize - Generate visual outline
router.post('/:id/visualize', visualizeDocument);

export default router;
