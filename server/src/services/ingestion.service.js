import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

/**
 * Text Cleaning & Normalization for Dyslexia Reader
 * Removes noise, fixes OCR broken hyphenations, normalizes whitespace and punctuation.
 */
export function normalizeExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let cleaned = rawText
    // Standardize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Fix OCR hyphenated words at line breaks (e.g., "re- \nsearch" -> "research")
    .replace(/(\b[a-zA-Z]{2,})-\s*\n+\s*([a-zA-Z]{2,}\b)/g, '$1$2')
    // Fix OCR common ligature/character distortions
    .replace(/[““”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/—|–/g, ' - ')
    .replace(/…/g, '...')
    // Replace non-standard whitespace characters
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Remove isolated single-character junk from poor OCR (e.g., random stray symbols)
    .replace(/(?<=\n)\s*[\~\|\^\_\*\#\<\>]\s*(?=\n)/g, '\n');

  // Preserve paragraph blocks: split by 2+ newlines
  const paragraphs = cleaned
    .split(/\n\s*\n+/)
    .map(p => {
      // In a single paragraph, join single newline broken lines into continuous sentences
      return p
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    })
    .filter(p => p.length > 0);

  return paragraphs.join('\n\n');
}

/**
 * Extract text from Image file or buffer using Tesseract.js OCR
 */
export async function extractTextFromImage(imageBufferOrPath, onProgress = null) {
  try {
    const result = await Tesseract.recognize(
      imageBufferOrPath,
      'eng',
      {
        logger: (m) => {
          if (onProgress && typeof onProgress === 'function') {
            onProgress(m);
          }
        }
      }
    );

    const extractedRaw = result?.data?.text || '';
    const cleanedText = normalizeExtractedText(extractedRaw);

    return {
      success: true,
      rawText: extractedRaw,
      cleanedText: cleanedText || 'No clear text detected in image.',
      confidence: result?.data?.confidence || 0,
      sourceType: 'image'
    };
  } catch (error) {
    console.error('[IngestionService] OCR Error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Extract text from PDF buffer using pdf-parse
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const extractedRaw = data.text || '';
    const cleanedText = normalizeExtractedText(extractedRaw);

    return {
      success: true,
      rawText: extractedRaw,
      cleanedText: cleanedText || 'No readable text content found in PDF.',
      totalPages: data.numpages || 1,
      info: data.info || {},
      sourceType: 'pdf'
    };
  } catch (error) {
    console.error('[IngestionService] PDF Error:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

/**
 * Generate a friendly document title from text or filename
 */
export function deriveDocumentTitle(text, originalFilename = null) {
  if (originalFilename) {
    return originalFilename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }
  if (!text) return 'Untitled Document';

  const firstLine = text.trim().split('\n')[0].replace(/[^\w\s-]/g, '').trim();
  if (firstLine && firstLine.length <= 60) {
    return firstLine;
  }
  const words = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return words ? `${words}...` : 'Untitled Document';
}
