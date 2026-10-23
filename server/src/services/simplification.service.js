/**
 * Rule-Based / NLP Simplification Service
 * Provides readability analysis, sentence splitting, lexical simplification,
 * syllable breakdown, and difficult word annotation for dyslexic readers.
 */

// Comprehensive Lexical Simplification & Difficult Word Knowledge Base
const COMPLEX_WORD_MAP = {
  // Academic & Formal Transition / Multi-syllable Words
  "furthermore": { simple: "also", syllables: ["fur", "ther", "more"], def: "in addition; also" },
  "consequently": { simple: "so", syllables: ["con", "se", "quent", "ly"], def: "as a result" },
  "nevertheless": { simple: "still", syllables: ["nev", "er", "the", "less"], def: "even though that is true" },
  "moreover": { simple: "also", syllables: ["more", "o", "ver"], def: "plus; in addition" },
  "notwithstanding": { simple: "despite", syllables: ["not", "with", "stand", "ing"], def: "in spite of" },
  "subsequently": { simple: "later", syllables: ["sub", "se", "quent", "ly"], def: "afterward or next" },
  "accordingly": { simple: "so", syllables: ["ac", "cord", "ing", "ly"], def: "in a matching way" },
  "predominantly": { simple: "mostly", syllables: ["pre", "dom", "i", "nant", "ly"], def: "mainly; mostly" },
  "simultaneously": { simple: "at the same time", syllables: ["si", "mul", "ta", "ne", "ous", "ly"], def: "happening together" },
  "comprehensively": { simple: "fully", syllables: ["com", "pre", "hen", "sive", "ly"], def: "completely and thoroughly" },
  
  // Verbs
  "utilize": { simple: "use", syllables: ["u", "ti", "lize"], def: "to use something" },
  "utilizes": { simple: "uses", syllables: ["u", "ti", "liz", "es"], def: "uses something" },
  "utilized": { simple: "used", syllables: ["u", "ti", "lized"], def: "used something" },
  "utilizing": { simple: "using", syllables: ["u", "ti", "liz", "ing"], def: "using something" },
  "demonstrate": { simple: "show", syllables: ["dem", "on", "strate"], def: "to show or prove clearly" },
  "demonstrates": { simple: "shows", syllables: ["dem", "on", "strates"], def: "shows or proves" },
  "demonstrated": { simple: "showed", syllables: ["dem", "on", "strat", "ed"], def: "showed or proved" },
  "demonstrating": { simple: "showing", syllables: ["dem", "on", "strat", "ing"], def: "showing clearly" },
  "facilitate": { simple: "help", syllables: ["fa", "cil", "i", "tate"], def: "to make something easier" },
  "facilitates": { simple: "helps", syllables: ["fa", "cil", "i", "tates"], def: "makes easier" },
  "facilitated": { simple: "helped", syllables: ["fa", "cil", "i", "tat", "ed"], def: "made easier" },
  "facilitating": { simple: "helping", syllables: ["fa", "cil", "i", "tat", "ing"], def: "making easier" },
  "commence": { simple: "start", syllables: ["com", "mence"], def: "to begin" },
  "commences": { simple: "starts", syllables: ["com", "menc", "es"], def: "begins" },
  "commenced": { simple: "started", syllables: ["com", "menced"], def: "began" },
  "commencing": { simple: "starting", syllables: ["com", "menc", "ing"], def: "beginning" },
  "terminate": { simple: "end", syllables: ["ter", "mi", "nate"], def: "to finish or stop" },
  "terminates": { simple: "ends", syllables: ["ter", "mi", "nates"], def: "stops" },
  "terminated": { simple: "ended", syllables: ["ter", "mi", "nat", "ed"], def: "stopped" },
  "implement": { simple: "carry out", syllables: ["im", "ple", "ment"], def: "to put into action" },
  "implemented": { simple: "carried out", syllables: ["im", "ple", "ment", "ed"], def: "put into action" },
  "implementing": { simple: "carrying out", syllables: ["im", "ple", "ment", "ing"], def: "putting into action" },
  "ascertain": { simple: "find out", syllables: ["as", "cer", "tain"], def: "to learn or discover" },
  "deteriorate": { simple: "worsen", syllables: ["de", "te", "ri", "o", "rate"], def: "to become worse" },
  "ameliorate": { simple: "improve", syllables: ["a", "me", "lio", "rate"], def: "to make better" },
  "disseminate": { simple: "spread", syllables: ["dis", "sem", "i", "nate"], def: "to share or distribute" },
  "substantiate": { simple: "prove", syllables: ["sub", "stan", "ti", "ate"], def: "to give evidence for" },
  "expedite": { simple: "speed up", syllables: ["ex", "pe", "dite"], def: "to make faster" },
  "recapitulate": { simple: "sum up", syllables: ["re", "ca", "pit", "u", "late"], def: "to repeat main points" },
  "scrutinize": { simple: "inspect", syllables: ["scru", "ti", "nize"], def: "to look at very closely" },
  "exacerbate": { simple: "make worse", syllables: ["ex", "ac", "er", "bate"], def: "to make a problem bigger" },
  "relinquish": { simple: "give up", syllables: ["re", "lin", "quish"], def: "to let go of" },
  "comprehend": { simple: "understand", syllables: ["com", "pre", "hend"], def: "to understand completely" },
  "comprehends": { simple: "understands", syllables: ["com", "pre", "hends"], def: "understands" },
  "comprehended": { simple: "understood", syllables: ["com", "pre", "hend", "ed"], def: "understood" },
  "differentiate": { simple: "tell apart", syllables: ["dif", "fer", "en", "ti", "ate"], def: "to see the difference" },
  "synthesize": { simple: "combine", syllables: ["syn", "the", "size"], def: "to combine ideas together" },
  "articulate": { simple: "express", syllables: ["ar", "tic", "u", "late"], def: "to say clearly" },
  "collaborate": { simple: "work together", syllables: ["col", "lab", "o", "rate"], def: "to work with others" },
  "accommodate": { simple: "fit", syllables: ["ac", "com", "mo", "date"], def: "to make room for or adapt to" },
  "contemplate": { simple: "think about", syllables: ["con", "tem", "plate"], def: "to look at or think about" },
  "endeavor": { simple: "try", syllables: ["en", "deav", "or"], def: "to try hard" },
  "endeavors": { simple: "tries", syllables: ["en", "deav", "ors"], def: "tries hard" },
  "perceive": { simple: "see", syllables: ["per", "ceive"], def: "to notice or understand" },
  "perceived": { simple: "saw", syllables: ["per", "ceived"], def: "noticed or understood" },
  "eliminate": { simple: "remove", syllables: ["e", "lim", "i", "nate"], def: "to get rid of" },
  "eliminates": { simple: "removes", syllables: ["e", "lim", "i", "nates"], def: "gets rid of" },
  "diminish": { simple: "decrease", syllables: ["di", "min", "ish"], def: "to make or become smaller" },
  "augment": { simple: "increase", syllables: ["aug", "ment"], def: "to add to or make larger" },
  "proliferate": { simple: "multiply", syllables: ["pro", "lif", "er", "ate"], def: "to grow quickly in number" },
  
  // Adjectives & Nouns
  "substantial": { simple: "large", syllables: ["sub", "stan", "tial"], def: "large in amount or value" },
  "fundamental": { simple: "basic", syllables: ["fun", "da", "men", "tal"], def: "core or main principle" },
  "advantageous": { simple: "helpful", syllables: ["ad", "van", "ta", "geous"], def: "giving an advantage" },
  "detrimental": { simple: "harmful", syllables: ["det", "ri", "men", "tal"], def: "causing damage" },
  "erroneous": { simple: "wrong", syllables: ["er", "ro", "ne", "ous"], def: "incorrect or mistaken" },
  "feasible": { simple: "possible", syllables: ["fea", "si", "ble"], def: "able to be done easily" },
  "magnitude": { simple: "size", syllables: ["mag", "ni", "tude"], def: "great size or importance" },
  "phenomenon": { simple: "event", syllables: ["phe", "nom", "e", "non"], def: "a notable fact or event" },
  "phenomena": { simple: "events", syllables: ["phe", "nom", "e", "na"], def: "remarkable facts or events" },
  "hypothesis": { simple: "theory", syllables: ["hy", "poth", "e", "sis"], def: "an educated guess or idea" },
  "hypotheses": { simple: "theories", syllables: ["hy", "poth", "e", "ses"], def: "educated guesses" },
  "methodology": { simple: "method", syllables: ["meth", "od", "ol", "o", "gy"], def: "a set of methods used" },
  "prerequisite": { simple: "requirement", syllables: ["pre", "req", "ui", "site"], def: "something needed before" },
  "ramification": { simple: "result", syllables: ["ram", "i", "fi", "ca", "tion"], def: "a consequence or effect" },
  "ramifications": { simple: "results", syllables: ["ram", "i", "fi", "ca", "tions"], def: "consequences or effects" },
  "surplus": { simple: "extra", syllables: ["sur", "plus"], def: "more than needed" },
  "deficiency": { simple: "shortage", syllables: ["de", "fi", "cien", "cy"], def: "a lack of something" },
  "ambiguous": { simple: "unclear", syllables: ["am", "big", "u", "ous"], def: "having multiple meanings" },
  "conspicuous": { simple: "noticeable", syllables: ["con", "spic", "u", "ous"], def: "easily seen" },
  "meticulous": { simple: "careful", syllables: ["me", "tic", "u", "lous"], def: "very careful with details" },
  "ubiquitous": { simple: "everywhere", syllables: ["u", "biq", "ui", "tous"], def: "found all around" },
  "formidable": { simple: "tough", syllables: ["for", "mi", "da", "ble"], def: "causing fear or respect" },
  "intricate": { simple: "complex", syllables: ["in", "tri", "cate"], def: "having many fine parts" },
  "prevalent": { simple: "common", syllables: ["prev", "a", "lent"], def: "widespread or common" },
  "redundant": { simple: "unneeded", syllables: ["re", "dun", "dant"], def: "no longer needed" },
  "lucid": { simple: "clear", syllables: ["lu", "cid"], def: "easy to understand" },
  "resilient": { simple: "strong", syllables: ["re", "sil", "ient"], def: "able to bounce back quickly" },
  "autonomous": { simple: "independent", syllables: ["au", "ton", "o", "mous"], def: "acting on its own" },
  "photosynthesis": { simple: "plant food making", syllables: ["pho", "to", "syn", "the", "sis"], def: "how plants make food using sunlight" },
  "biodiversity": { simple: "variety of life", syllables: ["bi", "o", "di", "ver", "si", "ty"], def: "number of different species" },
  "cardiovascular": { simple: "heart and blood", syllables: ["car", "di", "o", "vas", "cu", "lar"], def: "relating to the heart and vessels" },
  "equilibrium": { simple: "balance", syllables: ["e", "qui", "lib", "ri", "um"], def: "a state of equal balance" },
  "circumstances": { simple: "situations", syllables: ["cir", "cum", "stan", "ces"], def: "the conditions around an event" },
  "perspective": { simple: "viewpoint", syllables: ["per", "spec", "tive"], def: "a way of seeing things" },
  "characteristics": { simple: "features", syllables: ["char", "ac", "ter", "is", "tics"], def: "qualities that define something" }
};

// Wordy Phrasal Patterns to replace with concise wording
const WORDY_PHRASES = [
  { pattern: /\bin order to\b/gi, replacement: "to" },
  { pattern: /\bdue to the fact that\b/gi, replacement: "because" },
  { pattern: /\bat this point in time\b/gi, replacement: "now" },
  { pattern: /\ba large number of\b/gi, replacement: "many" },
  { pattern: /\bin the event that\b/gi, replacement: "if" },
  { pattern: /\bin spite of the fact that\b/gi, replacement: "although" },
  { pattern: /\bfor the purpose of\b/gi, replacement: "for" },
  { pattern: /\bwith reference to\b/gi, replacement: "about" },
  { pattern: /\bis able to\b/gi, replacement: "can" },
  { pattern: /\bare able to\b/gi, replacement: "can" },
  { pattern: /\bhas the ability to\b/gi, replacement: "can" },
  { pattern: /\btake into consideration\b/gi, replacement: "consider" },
  { pattern: /\bgive consideration to\b/gi, replacement: "consider" },
  { pattern: /\bmake a decision\b/gi, replacement: "decide" },
  { pattern: /\bconduct an investigation\b/gi, replacement: "investigate" },
  { pattern: /\bplay a crucial role in\b/gi, replacement: "help" }
];

/**
 * Count syllables of an English word using phonetic heuristics
 */
export function countSyllables(word) {
  if (!word) return 1;
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length <= 3) return 1;

  // Syllables heuristic
  const vowels = "aeiouy";
  let count = 0;
  let prevIsVowel = false;

  for (let i = 0; i < cleaned.length; i++) {
    const isVowel = vowels.includes(cleaned[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }

  // Adjust for silent 'e' at the end
  if (cleaned.endsWith('e') && !cleaned.endsWith('le') && count > 1) {
    count--;
  }

  // Adjust for 'ed' endings that are not distinct syllables (e.g. 'walked' vs 'wanted')
  if (cleaned.endsWith('ed') && !cleaned.endsWith('ted') && !cleaned.endsWith('ded') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Splits a word into approximate phonetic syllables for visual dyslexic display
 */
export function divideWordIntoSyllables(word) {
  const clean = word.replace(/[^a-zA-Z]/g, '');
  if (!clean) return [word];
  const lower = clean.toLowerCase();

  if (COMPLEX_WORD_MAP[lower] && COMPLEX_WORD_MAP[lower].syllables) {
    return COMPLEX_WORD_MAP[lower].syllables;
  }

  if (clean.length <= 4) return [clean];

  // Algorithmic syllable division
  const vowels = "aeiouyAEIOUY";
  const parts = [];
  let current = "";

  for (let i = 0; i < clean.length; i++) {
    current += clean[i];
    const isCurrentVowel = vowels.includes(clean[i]);
    const isNextConsonant = i + 1 < clean.length && !vowels.includes(clean[i + 1]);
    const isNextNextVowel = i + 2 < clean.length && vowels.includes(clean[i + 2]);

    // Split rule: Vowel + Consonant + Vowel -> split after vowel (e.g. o-ver)
    if (isCurrentVowel && isNextConsonant && isNextNextVowel && current.length >= 2 && i + 2 < clean.length) {
      parts.push(current);
      current = "";
    }
    // Split rule: Double consonants (e.g. let-ter, hap-pen)
    else if (
      !isCurrentVowel &&
      i + 1 < clean.length &&
      clean[i].toLowerCase() === clean[i + 1].toLowerCase() &&
      current.length >= 2
    ) {
      parts.push(current);
      current = "";
    }
  }

  if (current) parts.push(current);
  return parts.length > 0 ? parts : [clean];
}

/**
 * Calculate Flesch Reading Ease and Flesch-Kincaid Grade Level
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

  // Sentences
  const rawSentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = Math.max(1, rawSentences.length);

  // Words
  const rawWords = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
  const wordCount = Math.max(1, rawWords.length);

  // Syllables
  let syllableCount = 0;
  rawWords.forEach(w => {
    syllableCount += countSyllables(w);
  });

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  // Standard Flesch formulas
  const readingEase = Math.round(
    Math.max(0, Math.min(100, 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord)))
  );

  const kincaidGrade = Math.max(
    1,
    Math.round((0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59) * 10) / 10
  );

  return {
    fleschReadingEase: readingEase,
    fleschKincaidGrade: kincaidGrade,
    totalWords: wordCount,
    totalSentences: sentenceCount,
    totalSyllables: syllableCount,
    avgWordsPerSentence: Math.round(wordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(syllablesPerWord * 100) / 100
  };
}

/**
 * Syntactic Simplification: Split compound/long sentences into digestible chunks
 */
export function splitComplexSentences(sentence, level = 'moderate') {
  if (!sentence || sentence.trim().length === 0) return [];
  const words = sentence.trim().split(/\s+/);

  // Length threshold based on level
  const maxWords = level === 'high' ? 14 : level === 'moderate' ? 22 : 30;
  if (words.length <= maxWords) return [sentence.trim()];

  // Transition connectors to split on
  const splitPatterns = [
    { regex: /,\s+(which\s+(?:is|are|was|were|has|have|can|will))\s+/i, replace: ". This $1 " },
    { regex: /,\s+(whereas|while|although|even though)\s+/i, replace: ". In contrast, " },
    { regex: /,\s+(furthermore|moreover|consequently|nevertheless|therefore|thus)\s*,?\s*/i, replace: ". Also, " },
    { regex: /,\s+(and\s+therefore|and\s+thus|and\s+as\s+a\s+result)\s+/i, replace: ". As a result, " },
    { regex: /;\s+/g, replace: ". " }
  ];

  let transformed = sentence;
  for (const { regex, replace } of splitPatterns) {
    transformed = transformed.replace(regex, replace);
  }

  // Split into separate sentences
  const pieces = transformed
    .split(/(?<=[.?!])\s+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Ensure sentence starts with capital letter and ends with punctuation
      let cap = p.charAt(0).toUpperCase() + p.slice(1);
      if (!/[.?!]$/.test(cap)) {
        cap += '.';
      }
      return cap;
    });

  return pieces.length > 0 ? pieces : [sentence];
}

/**
 * Lexical Simplification & Difficult Word Detection
 */
export function simplifyLexicon(text, level = 'moderate') {
  let simplified = text;

  // 1. Replace wordy phrases first
  WORDY_PHRASES.forEach(({ pattern, replacement }) => {
    simplified = simplified.replace(pattern, replacement);
  });

  const difficultWordsMap = new Map();

  // 2. Tokenize and identify complex words
  const words = simplified.split(/(\s+|[.,!?;:"'()[\]{}])/);
  const processedTokens = words.map(token => {
    const cleanWord = token.replace(/[^a-zA-Z]/g, '');
    if (!cleanWord) return token;

    const lower = cleanWord.toLowerCase();
    const isCapitalized = /^[A-Z]/.test(cleanWord);
    const isAllUpper = /^[A-Z]+$/.test(cleanWord) && cleanWord.length > 1;

    // Check if word is in complex dictionary
    if (COMPLEX_WORD_MAP[lower]) {
      const entry = COMPLEX_WORD_MAP[lower];
      let replacement = entry.simple;

      if (isAllUpper) replacement = replacement.toUpperCase();
      else if (isCapitalized) replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);

      // Register difficult word details
      if (!difficultWordsMap.has(lower)) {
        difficultWordsMap.set(lower, {
          word: lower,
          originalWord: cleanWord,
          simplifiedWord: entry.simple,
          syllables: entry.syllables,
          definition: entry.def,
          synonyms: [entry.simple, "plain word"],
          frequency: 1
        });
      } else {
        difficultWordsMap.get(lower).frequency++;
      }

      // In light mode, only substitute very hard words (>3 syllables)
      if (level === 'light' && entry.syllables.length < 4) {
        return token;
      }

      return token.replace(cleanWord, replacement);
    }

    // Check algorithmic syllable count for untracked polysyllabic words
    const syllablesCount = countSyllables(cleanWord);
    const minSyllables = level === 'high' ? 3 : 4;

    if (syllablesCount >= minSyllables && cleanWord.length > 6) {
      if (!difficultWordsMap.has(lower)) {
        difficultWordsMap.set(lower, {
          word: lower,
          originalWord: cleanWord,
          simplifiedWord: cleanWord,
          syllables: divideWordIntoSyllables(cleanWord),
          definition: `Multi-syllable word (${syllablesCount} syllables)`,
          synonyms: [],
          frequency: 1
        });
      } else {
        difficultWordsMap.get(lower).frequency++;
      }
    }

    return token;
  });

  return {
    simplifiedText: processedTokens.join(''),
    difficultWords: Array.from(difficultWordsMap.values())
  };
}

/**
 * Main Simplification Pipeline for Full Documents / Paragraphs
 */
export function processTextPipeline(rawText, level = 'moderate') {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Valid text content is required');
  }

  // Normalize raw text (preserve paragraph structure)
  const normalizedRaw = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Split into paragraphs (separated by double newlines or single newline with significant length)
  const rawParagraphs = normalizedRaw
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const paragraphs = [];
  const allDifficultWordsMap = new Map();
  const simplifiedParagraphTexts = [];

  rawParagraphs.forEach((pText, index) => {
    // 1. Split paragraph into sentences
    const rawSentences = pText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 2. Syntactic sentence splitting
    const simplifiedSentences = [];
    rawSentences.forEach(s => {
      const splitPieces = splitComplexSentences(s, level);
      simplifiedSentences.push(...splitPieces);
    });

    // 3. Lexical simplification per paragraph
    const combinedSentenceText = simplifiedSentences.join(' ');
    const { simplifiedText, difficultWords } = simplifyLexicon(combinedSentenceText, level);

    // Aggregate difficult words
    difficultWords.forEach(dw => {
      if (allDifficultWordsMap.has(dw.word)) {
        allDifficultWordsMap.get(dw.word).frequency += dw.frequency;
      } else {
        allDifficultWordsMap.set(dw.word, { ...dw });
      }
    });

    // Calculate readability metrics for this paragraph
    const origReadability = calculateReadability(pText);
    const simpReadability = calculateReadability(simplifiedText);

    paragraphs.push({
      paragraphIndex: index,
      text: pText,
      simplifiedText,
      difficultWords,
      stats: {
        originalWordCount: origReadability.totalWords,
        simplifiedWordCount: simpReadability.totalWords,
        originalSentenceCount: origReadability.totalSentences,
        simplifiedSentenceCount: simpReadability.totalSentences,
        fleschKincaidOriginal: origReadability.fleschKincaidGrade,
        fleschKincaidSimplified: simpReadability.fleschKincaidGrade,
        readingEaseOriginal: origReadability.fleschReadingEase,
        readingEaseSimplified: simpReadability.fleschReadingEase
      }
    });

    simplifiedParagraphTexts.push(simplifiedText);
  });

  const fullSimplifiedText = simplifiedParagraphTexts.join('\n\n');
  const fullOriginalReadability = calculateReadability(normalizedRaw);
  const fullSimplifiedReadability = calculateReadability(fullSimplifiedText);

  // Improvement calculation
  const gradeDrop = Math.max(0, fullOriginalReadability.fleschKincaidGrade - fullSimplifiedReadability.fleschKincaidGrade);
  const improvementPercent = Math.round(
    Math.min(100, Math.max(0, ((fullSimplifiedReadability.fleschReadingEase - fullOriginalReadability.fleschReadingEase) / (100 - fullOriginalReadability.fleschReadingEase || 1)) * 100))
  );

  const estimatedReadingTimeMinutes = Math.max(
    1,
    Math.ceil(fullSimplifiedReadability.totalWords / 130)
  );

  return {
    rawText: normalizedRaw,
    simplifiedText: fullSimplifiedText,
    simplificationLevel: level,
    paragraphs,
    difficultWords: Array.from(allDifficultWordsMap.values()),
    readabilityScore: {
      fleschReadingEase: fullSimplifiedReadability.fleschReadingEase,
      fleschKincaidGrade: fullSimplifiedReadability.fleschKincaidGrade,
      originalGrade: fullOriginalReadability.fleschKincaidGrade,
      originalReadingEase: fullOriginalReadability.fleschReadingEase,
      improvementPercent,
      estimatedReadingTimeMinutes,
      gradeDrop: Math.round(gradeDrop * 10) / 10
    }
  };
}
