import crypto from 'node:crypto';

import {
  extractTextFromImage,
  extractTextFromPDF,
  normalizeExtractedText
} from './ingestion.service.js';
import { processTextPipeline } from './simplification.service.js';

function deriveDocumentTitle(text, filename = '') {
  if (filename) {
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    if (title) return title;
  }

  const firstLine = String(text || '').split(/\r?\n/).find(Boolean)?.trim();
  if (firstLine) return firstLine.slice(0, 60);
  return 'Untitled Document';
}

function validLevel(level) {
  return ['light', 'moderate', 'high'].includes(level) ? level : 'moderate';
}

export async function submitTextDocument(req, res) {
  try {
    const { text, title, simplificationLevel = 'moderate' } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, error: 'Please provide text to simplify.' });
    }

    const level = validLevel(simplificationLevel);
    const processed = processTextPipeline(normalizeExtractedText(String(text)), level);

    const document = {
      id: crypto.randomUUID(),
      title: title?.trim() || deriveDocumentTitle(text),
      sourceType: 'typed',
      rawText: processed.rawText,
      simplifiedText: processed.simplifiedText,
      simplificationLevel: level,
      paragraphs: processed.paragraphs,
      difficultWords: processed.difficultWords,
      readabilityScore: processed.readabilityScore,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('[DocumentService] Text processing error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to simplify text.' });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded. Please provide a PDF or image.' });
    }

    const file = req.file;
    const name = file.originalname.toLowerCase();
    let extracted;

    if (file.mimetype === 'application/pdf' || name.endsWith('.pdf')) {
      extracted = await extractTextFromPDF(file.buffer);
    } else if (file.mimetype.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(name)) {
      extracted = await extractTextFromImage(file.buffer);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file format. Use PDF, PNG, JPG, JPEG, WebP, BMP or TIFF.' });
    }

    const extractedText = extracted.cleanedText || extracted.rawText;
    if (!extractedText?.trim()) {
      return res.status(422).json({
        success: false,
        error: extracted.sourceType === 'image'
          ? 'No readable text was detected in the image.'
          : 'No readable text was found in the PDF.'
      });
    }

    const level = validLevel(req.body?.simplificationLevel);
    const processed = processTextPipeline(extractedText, level);

    const document = {
      id: crypto.randomUUID(),
      title: req.body?.title?.trim() || deriveDocumentTitle(extractedText, file.originalname),
      sourceType: extracted.sourceType,
      originalFilename: file.originalname,
      rawText: processed.rawText,
      simplifiedText: processed.simplifiedText,
      simplificationLevel: level,
      paragraphs: processed.paragraphs,
      difficultWords: processed.difficultWords,
      readabilityScore: processed.readabilityScore,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      document,
      extractionMeta: {
        sourceType: extracted.sourceType,
        confidence: extracted.confidence,
        totalPages: extracted.totalPages || null
      }
    });
  } catch (error) {
    console.error('[DocumentService] Upload error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to process uploaded document.' });
  }
}

export function reSimplifyDocument(req, res) {
  try {
    const { rawText } = req.body || {};
    const level = validLevel(req.body?.simplificationLevel);

    if (!rawText?.trim()) {
      return res.status(400).json({ success: false, error: 'Original text is required.' });
    }

    const processed = processTextPipeline(normalizeExtractedText(rawText), level);

    return res.json({
      success: true,
      document: {
        rawText: processed.rawText,
        simplifiedText: processed.simplifiedText,
        simplificationLevel: level,
        paragraphs: processed.paragraphs,
        difficultWords: processed.difficultWords,
        readabilityScore: processed.readabilityScore
      }
    });
  } catch (error) {
    console.error('[DocumentService] Re-simplification error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to change simplification level.' });
  }
}
