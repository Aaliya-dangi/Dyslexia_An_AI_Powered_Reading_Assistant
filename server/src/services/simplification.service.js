
/**
 * NLP Simplification Service
 *
 * AI model:
 *   Groq + OpenAI GPT-OSS 20B
 *
 * AI handles:
 *   - vocabulary simplification
 *   - sentence restructuring
 *   - difficult-word identification
 *   - definitions
 *   - simpler replacements
 *
 * Local code handles:
 *   - text normalization
 *   - paragraph handling
 *   - difficult-word validation
 *   - syllable estimation
 *   - readability calculations
 *   - before/after statistics
 */

import { simplifyWithGemini } from './gemini.service.js';

/**
 * Count syllables using a lightweight English heuristic.
 *
 * Used only for readability statistics.
 * It is NOT used for simplification.
 */
export function countSyllables(word) {
  if (!word) return 1;

  const cleaned = word
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  if (cleaned.length <= 3) return 1;

  const vowels = 'aeiouy';

  let count = 0;
  let previousVowel = false;

  for (let i = 0; i < cleaned.length; i++) {
    const isVowel = vowels.includes(cleaned[i]);

    if (isVowel && !previousVowel) {
      count++;
    }

    previousVowel = isVowel;
  }

  if (
    cleaned.endsWith('e') &&
    !cleaned.endsWith('le') &&
    count > 1
  ) {
    count--;
  }

  if (
    cleaned.endsWith('ed') &&
    !cleaned.endsWith('ted') &&
    !cleaned.endsWith('ded') &&
    count > 1
  ) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Calculate Flesch Reading Ease and
 * Flesch-Kincaid Grade Level.
 */
export function calculateReadability(text) {
  if (!text || text.trim().length === 0) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGrade: 1,
      totalWords: 0,
      totalSentences: 0,
      totalSyllables: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0
    };
  }

  const rawSentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const sentenceCount =
    Math.max(1, rawSentences.length);

  const rawWords = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const wordCount =
    Math.max(1, rawWords.length);

  let syllableCount = 0;

  rawWords.forEach(word => {
    syllableCount += countSyllables(word);
  });

  const wordsPerSentence =
    wordCount / sentenceCount;

  const syllablesPerWord =
    syllableCount / wordCount;

  const readingEase = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        206.835 -
          1.015 * wordsPerSentence -
          84.6 * syllablesPerWord
      )
    )
  );

  const kincaidGrade = Math.max(
    1,
    Math.round(
      (
        0.39 * wordsPerSentence +
        11.8 * syllablesPerWord -
        15.59
      ) * 10
    ) / 10
  );

  return {
    fleschReadingEase: readingEase,

    fleschKincaidGrade: kincaidGrade,

    totalWords: wordCount,

    totalSentences: sentenceCount,

    totalSyllables: syllableCount,

    avgWordsPerSentence:
      Math.round(wordsPerSentence * 10) / 10,

    avgSyllablesPerWord:
      Math.round(syllablesPerWord * 100) / 100
  };
}

/**
 * Normalize incoming text.
 */
function normalizeText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Split paragraphs.
 */
function splitParagraphs(text) {
  return text
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * Escape a string for use inside RegExp.
 */
function escapeRegExp(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

/**
 * Check whether a difficult word genuinely exists
 * as a complete word in the original passage.
 */
function countWordOccurrences(text, word) {
  if (!word) return 0;

  const escaped = escapeRegExp(
    word.trim()
  );

  if (!escaped) return 0;

  const regex = new RegExp(
    `(?<![A-Za-z])${escaped}(?![A-Za-z])`,
    'gi'
  );

  return (
    text.match(regex)?.length || 0
  );
}

/**
 * Validate and normalize difficult words returned
 * by the AI.
 *
 * This prevents random AI output from becoming
 * highlighted in the UI.
 */
function normalizeDifficultWords(
  words,
  originalText
) {
  const counts = new Map();

  for (const item of words || []) {
    const originalWord = String(
      item.originalWord ||
      item.word ||
      ''
    ).trim();

    if (!originalWord) continue;

    /*
     * Only accept words that really occur
     * in the original passage.
     */
    const frequency =
      countWordOccurrences(
        originalText,
        originalWord
      );

    if (frequency === 0) continue;

    const key =
      originalWord.toLowerCase();

    const previous =
      counts.get(key);

    if (previous) {
      previous.frequency += frequency;
      continue;
    }

    counts.set(key, {
      word: key,

      originalWord,

      simplifiedWord: String(
        item.simplifiedWord || ''
      ).trim(),

      syllables: [],

      definition: String(
        item.definition || ''
      ).trim(),

      synonyms:
        Array.isArray(item.synonyms)
          ? item.synonyms
              .map(String)
              .map(s => s.trim())
              .filter(Boolean)
          : [],

      frequency
    });
  }

  return Array.from(
    counts.values()
  );
}

/**
 * Main asynchronous NLP pipeline.
 */
export async function processTextPipeline(
  rawText,
  level = 'moderate'
) {
  if (
    !rawText ||
    typeof rawText !== 'string'
  ) {
    throw new Error(
      'Valid text content is required'
    );
  }

  const normalizedRaw =
    normalizeText(rawText);

  const originalParagraphs =
    splitParagraphs(normalizedRaw);

  /*
   * AI performs the actual simplification.
   */
  const {
    simplifiedText,
    difficultWords:
      aiDifficultWords
  } = await simplifyWithGemini(
    normalizedRaw,
    level
  );

  const simplifiedParagraphs =
    splitParagraphs(
      simplifiedText
    );

  /*
   * Validate difficult words globally
   * before sending them to the frontend.
   */
  const validatedDifficultWords =
    normalizeDifficultWords(
      aiDifficultWords,
      normalizedRaw
    );

  const paragraphs =
    originalParagraphs.map(
      (
        originalParagraph,
        index
      ) => {
        const simplifiedParagraph =
          simplifiedParagraphs[index] ||
          '';

        const originalReadability =
          calculateReadability(
            originalParagraph
          );

        const simplifiedReadability =
          calculateReadability(
            simplifiedParagraph
          );

        const paragraphDifficultWords =
          validatedDifficultWords.filter(
            item =>
              countWordOccurrences(
                originalParagraph,
                item.originalWord
              ) > 0
          );

        return {
          paragraphIndex: index,

          text: originalParagraph,

          simplifiedText:
            simplifiedParagraph,

          difficultWords:
            paragraphDifficultWords,

          stats: {
            originalWordCount:
              originalReadability.totalWords,

            simplifiedWordCount:
              simplifiedReadability.totalWords,

            originalSentenceCount:
              originalReadability.totalSentences,

            simplifiedSentenceCount:
              simplifiedReadability.totalSentences,

            fleschKincaidOriginal:
              originalReadability.fleschKincaidGrade,

            fleschKincaidSimplified:
              simplifiedReadability.fleschKincaidGrade,

            readingEaseOriginal:
              originalReadability.fleschReadingEase,

            readingEaseSimplified:
              simplifiedReadability.fleschReadingEase
          }
        };
      }
    );

  const fullOriginalReadability =
    calculateReadability(
      normalizedRaw
    );

  const fullSimplifiedReadability =
    calculateReadability(
      simplifiedText
    );

  const gradeDrop =
    Math.max(
      0,
      fullOriginalReadability
        .fleschKincaidGrade -
        fullSimplifiedReadability
          .fleschKincaidGrade
    );

  const improvementPercent =
    Math.round(
      Math.min(
        100,
        Math.max(
          0,
          (
            (
              fullSimplifiedReadability
                .fleschReadingEase -
              fullOriginalReadability
                .fleschReadingEase
            ) /
            (
              100 -
              fullOriginalReadability
                .fleschReadingEase ||
              1
            )
          ) * 100
        )
      )
    );

  const estimatedReadingTimeMinutes =
    Math.max(
      1,
      Math.ceil(
        fullSimplifiedReadability
          .totalWords / 130
      )
    );

  return {
    rawText: normalizedRaw,

    simplifiedText,

    simplificationLevel: level,

    paragraphs,

    difficultWords:
      validatedDifficultWords,

    readabilityScore: {
      fleschReadingEase:
        fullSimplifiedReadability
          .fleschReadingEase,

      fleschKincaidGrade:
        fullSimplifiedReadability
          .fleschKincaidGrade,

      originalGrade:
        fullOriginalReadability
          .fleschKincaidGrade,

      originalReadingEase:
        fullOriginalReadability
          .fleschReadingEase,

      improvementPercent,

      estimatedReadingTimeMinutes,

      gradeDrop:
        Math.round(
          gradeDrop * 10
        ) / 10
    }
  };
}
