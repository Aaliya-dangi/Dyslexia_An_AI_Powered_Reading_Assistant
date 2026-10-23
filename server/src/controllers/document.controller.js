import { Document } from '../models/Document.js';
import { memoryStore } from '../store/memoryStore.js';
import { getDBStatus } from '../config/db.js';
import { processTextPipeline } from '../services/simplification.service.js';
import {
  extractTextFromImage,
  extractTextFromPDF,
  deriveDocumentTitle
} from '../services/ingestion.service.js';
import { VisualizationService } from '../services/visualization.service.js';

/**
 * Helper to save document to MongoDB if ready, or fallback to memoryStore
 */
async function saveDocument(docData) {
  const { ready } = getDBStatus();
  if (ready) {
    try {
      const doc = new Document(docData);
      return await doc.save();
    } catch (e) {
      console.warn('[DocController] MongoDB save failed, using memory store fallback:', e.message);
      return memoryStore.createDocument(docData);
    }
  }
  return memoryStore.createDocument(docData);
}

/**
 * Helper to fetch document
 */
async function findDocumentById(id) {
  const { ready } = getDBStatus();
  if (ready) {
    try {
      const doc = await Document.findById(id);
      if (doc) return doc;
    } catch (e) {
      // Fallback to memory store if ID format doesn't match ObjectId
    }
  }
  return memoryStore.getDocument(id);
}

/**
 * POST /api/documents/text
 * Process directly typed or pasted text
 */
export async function submitTextDocument(req, res) {
  try {
    const { text, title, simplificationLevel = 'moderate', userId = null } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide text to read.'
      });
    }

    const processed = processTextPipeline(text, simplificationLevel);
    const docTitle = title?.trim() || deriveDocumentTitle(text);

    const docData = {
      userId,
      title: docTitle,
      sourceType: 'typed',
      rawText: processed.rawText,
      simplifiedText: processed.simplifiedText,
      simplificationLevel,
      paragraphs: processed.paragraphs,
      difficultWords: processed.difficultWords,
      readabilityScore: processed.readabilityScore
    };

    const savedDoc = await saveDocument(docData);

    return res.status(201).json({
      success: true,
      document: savedDoc
    });
  } catch (error) {
    console.error('[DocController] submitTextDocument error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process text'
    });
  }
}

/**
 * POST /api/documents/upload
 * Upload and process image or PDF document via OCR
 */
export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please provide an image or PDF.'
      });
    }

    const file = req.file;
    const { simplificationLevel = 'moderate', title = null, userId = null } = req.body;
    let extracted = null;

    // Check mime type
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      extracted = await extractTextFromPDF(file.buffer);
    } else if (file.mimetype.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff)$/i.test(file.originalname)) {
      extracted = await extractTextFromImage(file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Please upload a PDF or Image (JPG, PNG, WebP).'
      });
    }

    const rawText = extracted.cleanedText || extracted.rawText;
    if (!rawText || rawText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: 'No readable text could be extracted from the uploaded file.'
      });
    }

    const processed = processTextPipeline(rawText, simplificationLevel);
    const docTitle = title?.trim() || deriveDocumentTitle(rawText, file.originalname);

    const docData = {
      userId,
      title: docTitle,
      sourceType: extracted.sourceType || 'image',
      originalFilename: file.originalname,
      rawText: processed.rawText,
      simplifiedText: processed.simplifiedText,
      simplificationLevel,
      paragraphs: processed.paragraphs,
      difficultWords: processed.difficultWords,
      readabilityScore: processed.readabilityScore
    };

    const savedDoc = await saveDocument(docData);

    return res.status(201).json({
      success: true,
      document: savedDoc,
      extractionMeta: {
        confidence: extracted.confidence,
        totalPages: extracted.totalPages,
        sourceType: extracted.sourceType
      }
    });
  } catch (error) {
    console.error('[DocController] uploadDocument error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process uploaded document'
    });
  }
}

/**
 * GET /api/documents/:id
 * Retrieve processed document
 */
export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const doc = await findDocumentById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    return res.json({
      success: true,
      document: doc
    });
  } catch (error) {
    console.error('[DocController] getDocumentById error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch document'
    });
  }
}

/**
 * POST /api/documents/:id/simplify
 * Re-run simplification with a different level (light, moderate, high)
 */
export async function reSimplifyDocument(req, res) {
  try {
    const { id } = req.params;
    const { simplificationLevel = 'moderate' } = req.body;

    const doc = await findDocumentById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const processed = processTextPipeline(doc.rawText, simplificationLevel);

    const updates = {
      simplificationLevel,
      simplifiedText: processed.simplifiedText,
      paragraphs: processed.paragraphs,
      difficultWords: processed.difficultWords,
      readabilityScore: processed.readabilityScore
    };

    let updatedDoc;
    const { ready } = getDBStatus();
    if (ready) {
      try {
        updatedDoc = await Document.findByIdAndUpdate(id, updates, { new: true });
      } catch (e) {
        updatedDoc = memoryStore.updateDocument(id, updates);
      }
    } else {
      updatedDoc = memoryStore.updateDocument(id, updates);
    }

    return res.json({
      success: true,
      document: updatedDoc || { ...doc.toObject?.() || doc, ...updates }
    });
  } catch (error) {
    console.error('[DocController] reSimplifyDocument error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to re-simplify document'
    });
  }
}

/**
 * GET /api/documents
 * List recent documents
 */
export async function listDocuments(req, res) {
  try {
    const { ready } = getDBStatus();
    let docs = [];
    if (ready) {
      try {
        docs = await Document.find().sort({ createdAt: -1 }).limit(20);
      } catch (e) {
        docs = memoryStore.listDocuments();
      }
    } else {
      docs = memoryStore.listDocuments();
    }

    return res.json({
      success: true,
      documents: docs
    });
  } catch (error) {
    console.error('[DocController] listDocuments error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to list documents'
    });
  }
}

/**
 * POST /api/documents/:id/visualize
 * Generate AI visual learning diagram / concept outline
 */
export async function visualizeDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await findDocumentById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const outline = VisualizationService.generateConceptOutline(doc.simplifiedText || doc.rawText);

    return res.json({
      success: true,
      visualization: outline
    });
  } catch (error) {
    console.error('[DocController] visualizeDocument error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate visual breakdown'
    });
  }
}
