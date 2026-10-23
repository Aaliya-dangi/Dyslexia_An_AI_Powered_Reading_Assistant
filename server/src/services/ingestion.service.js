import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

export function normalizeExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\b[a-zA-Z]{2,})-\s*\n+\s*([a-zA-Z]{2,}\b)/g, '$1$2')
    .replace(/[“”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/—|–/g, ' - ')
    .replace(/…/g, '...')
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/(?<=\n)\s*[\~\|\^\_\*\#\<\>]\s*(?=\n)/g, '\n');

  return cleaned
    .split(/\n\s*\n+/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export async function extractTextFromImage(imageBuffer, onProgress = null) {
  const language = process.env.OCR_LANG || 'eng';

  try {
    const result = await Tesseract.recognize(
      imageBuffer,
      language,
      {
        logger: (message) => {
          if (typeof onProgress === 'function') {
            onProgress(message);
          }

          if (message.status === 'recognizing text' && message.progress != null) {
            console.log(
              `[OCR] ${Math.round(message.progress * 100)}%`
            );
          }
        }
      }
    );

    const rawText = result?.data?.text || '';
    const cleanedText = normalizeExtractedText(rawText);

    return {
      sourceType: 'image',
      rawText,
      cleanedText,
      confidence: Number(result?.data?.confidence || 0)
    };
  } catch (error) {
    console.error('[OCR] Image recognition failed:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

export async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const rawText = data.text || '';
    const cleanedText = normalizeExtractedText(rawText);

    return {
      sourceType: 'pdf',
      rawText,
      cleanedText,
      totalPages: data.numpages || 1,
      confidence: null
    };
  } catch (error) {
    console.error('[PDF] Text extraction failed:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}