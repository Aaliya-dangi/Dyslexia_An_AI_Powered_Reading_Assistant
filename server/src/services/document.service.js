import crypto from 'node:crypto';

import {
  extractTextFromImage,
  extractTextFromPDF
} from './ingestion.service.js';

function deriveDocumentTitle(filename) {
  if (!filename) return 'Untitled Document';

  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .trim() || 'Untitled Document';
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please provide a PDF or image.'
      });
    }

    const file = req.file;
    const name = file.originalname.toLowerCase();

    let extracted;

    if (
      file.mimetype === 'application/pdf' ||
      name.endsWith('.pdf')
    ) {
      extracted = await extractTextFromPDF(file.buffer);
    } else if (
      file.mimetype.startsWith('image/') ||
      /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(name)
    ) {
      extracted = await extractTextFromImage(file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Use PDF, PNG, JPG, JPEG, WebP, BMP or TIFF.'
      });
    }

    const text = extracted.cleanedText;

    if (!text) {
      return res.status(422).json({
        success: false,
        error:
          extracted.sourceType === 'image'
            ? 'No readable text was detected in the image.'
            : 'No readable text was found in the PDF.'
      });
    }

    const document = {
      id: crypto.randomUUID(),
      title: deriveDocumentTitle(file.originalname),
      sourceType: extracted.sourceType,
      originalFilename: file.originalname,
      rawText: text,
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

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process uploaded document.'
    });
  }
}