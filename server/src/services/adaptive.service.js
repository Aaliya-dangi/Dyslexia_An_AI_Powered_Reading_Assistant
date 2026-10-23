/**
 * Adaptive Engine Service (Phase 3 foundation)
 * Analyzes reading behaviors: pause durations, backtrack counts, struggle words, and reading speed.
 * Generates dynamic personalization recommendations for the dyslexic reader.
 */

export class AdaptiveService {
  /**
   * Evaluate session events and recommend updated simplification or pacing
   */
  static analyzeReadingSession(sessionData) {
    const { events = [], wpm = 0, currentLevel = 'moderate' } = sessionData;

    let pauseCount = 0;
    let backtrackCount = 0;
    let wordFlagCount = 0;
    let totalPauseMs = 0;
    const struggleWords = [];

    events.forEach(e => {
      if (e.type === 'pause') {
        pauseCount++;
        totalPauseMs += (e.durationMs || 0);
      } else if (e.type === 'backtrack') {
        backtrackCount++;
      } else if (e.type === 'wordFlag' || e.type === 'wordPronounce') {
        wordFlagCount++;
        if (e.position?.word) struggleWords.push(e.position.word.toLowerCase());
      }
    });

    // Rule-based heuristic indicators for dyslexia reading adaptation
    let recommendedLevel = currentLevel;
    let pacingAdvice = 'normal';
    const suggestions = [];

    // High struggle indicators
    if (pauseCount >= 4 || backtrackCount >= 3 || wordFlagCount >= 3) {
      if (currentLevel === 'light') recommendedLevel = 'moderate';
      else if (currentLevel === 'moderate') recommendedLevel = 'high';
      pacingAdvice = 'slower';
      suggestions.push('High pause/backtrack frequency detected. Increasing text simplification.');
      suggestions.push('Consider activating the Reading Focus Ruler to minimize line jumping.');
    } else if (wpm > 180 && pauseCount <= 1 && backtrackCount === 0) {
      // Smooth reading indicator
      if (currentLevel === 'high') recommendedLevel = 'moderate';
      suggestions.push('Smooth reading pacing observed. Text difficulty maintained comfortably.');
    }

    return {
      sessionMetrics: {
        pauseCount,
        backtrackCount,
        wordFlagCount,
        totalPauseMs,
        uniqueStruggledWords: [...new Set(struggleWords)],
        averageWpm: wpm
      },
      adaptation: {
        currentLevel,
        recommendedLevel,
        pacingAdvice,
        suggestReadingRuler: pauseCount > 2 || backtrackCount > 1,
        suggestions
      }
    };
  }
}
