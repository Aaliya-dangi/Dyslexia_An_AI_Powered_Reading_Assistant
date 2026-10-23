/**
 * Speech Service (Phase 2 foundation)
 * Generates word timing metadata and phonetic pronunciation aids for Web Speech / TTS / STT.
 */

export class SpeechService {
  /**
   * Estimate word-boundary timing map for text blocks
   * (Used as fallback or synchronization helper for Web Speech API)
   */
  static generateTimingMap(text, speechRate = 0.9) {
    if (!text) return [];

    const words = text.split(/\s+/).filter(w => w.length > 0);
    // Base duration: standard English word is ~300ms at rate 1.0
    const baseDurationPerChar = (60 / (130 * 5)) * 1000 / speechRate;

    let currentOffsetMs = 0;
    const timingMap = words.map((w, index) => {
      const charCount = w.length;
      const duration = Math.max(180, Math.round(charCount * baseDurationPerChar));
      const entry = {
        wordIndex: index,
        word: w,
        startMs: currentOffsetMs,
        endMs: currentOffsetMs + duration,
        durationMs: duration
      };
      // Add brief pause for punctuation
      const pauseExtra = /[.,;?!]$/.test(w) ? 220 : 60;
      currentOffsetMs += duration + pauseExtra;
      return entry;
    });

    return {
      totalDurationMs: currentOffsetMs,
      timingMap
    };
  }

  /**
   * Compare spoken user transcript against target sentence for pronunciation feedback
   */
  static evaluatePronunciation(targetSentence, spokenSentence) {
    if (!targetSentence || !spokenSentence) {
      return { accuracyPercent: 0, matchedWords: [], missedWords: [] };
    }

    const clean = s => s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const targetWords = clean(targetSentence);
    const spokenWords = clean(spokenSentence);

    const matchedWords = [];
    const missedWords = [];

    targetWords.forEach(w => {
      if (spokenWords.includes(w)) {
        matchedWords.push(w);
      } else {
        missedWords.push(w);
      }
    });

    const accuracy = targetWords.length > 0
      ? Math.round((matchedWords.length / targetWords.length) * 100)
      : 0;

    return {
      targetWordCount: targetWords.length,
      spokenWordCount: spokenWords.length,
      matchedWords,
      missedWords,
      accuracyPercent: accuracy,
      encouragement: accuracy >= 80 ? 'Excellent pronunciation!' : accuracy >= 50 ? 'Good effort! Practice the highlighted words.' : 'Keep trying, take your time.'
    };
  }
}
