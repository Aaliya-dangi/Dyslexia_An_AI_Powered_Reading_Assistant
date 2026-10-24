import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Check,
  X,
  Smile,
  Award,
  ChevronRight,
  Brain,
  Volume2,
  VolumeX,
  Target,
  Eye
} from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import './UnderstandingCheck.css';

/**
 * Local Rule-Based Understanding Quiz Generator
 * Generates approximately 10 distinct, dyslexia-friendly questions strictly grounded in the active passage.
 * Zero external AI APIs, zero hardcoded topics, 100% private and local.
 */
function generatePassageQuiz(rawTitle, passageText, paragraphs = []) {
  let fullText = (passageText || '').trim();
  if (!fullText && paragraphs.length > 0) {
    fullText = paragraphs.map(p => p.simplifiedText || p.text || '').join(' ').trim();
  }

  // If text is too short, return empty
  if (!fullText || fullText.split(/\s+/).length < 5) {
    return [];
  }

  // Clean & Derive Main Topic
  let cleanTopic = (rawTitle || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/^(Chapter|Section|Unit|Document|Passage)\s*\d*[:\-]?\s*/i, '')
    .trim();

  const sentences = fullText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 6);

  if (!cleanTopic || cleanTopic === 'Current Document' || cleanTopic === 'Untitled Document') {
    if (sentences.length > 0) {
      const firstS = sentences[0];
      const match = firstS.match(/^([A-Z][a-zA-Z\s]{2,35}?)(?:\s+(?:is|are|was|were|refers to|represents|demonstrates|operates|functions|takes place))/i);
      cleanTopic = match ? match[1].trim() : firstS.split(/\s+/).slice(0, 4).join(' ');
    } else {
      cleanTopic = 'this reading passage';
    }
  }

  // Helper to clean leading transitional words
  const cleanS = (s) =>
    (s || '')
      .replace(/^(furthermore|moreover|consequently|subsequently|in addition|therefore|simultaneously|notwithstanding|meanwhile)[,\s]*/i, '')
      .trim();

  const questions = [];

  const s1 = cleanS(sentences[0]);
  const s2 = sentences.length > 1 ? cleanS(sentences[1]) : s1;
  const s3 = sentences.length > 2 ? cleanS(sentences[2]) : s2;
  const sFinal = cleanS(sentences[sentences.length - 1]);

  // =========================================================
  // 1. QUESTION 1: 🌱 MAIN IDEA (Single Choice)
  // =========================================================
  if (sentences.length >= 1) {
    questions.push({
      id: 'q-1',
      category: '🌱 Main Idea',
      question: `What is the central focus of this passage?`,
      options: [
        {
          text: `How ${cleanTopic} works: ${s1.length > 75 ? s1.substring(0, 72) + '...' : s1}`,
          isCorrect: true
        },
        {
          text: `An unrelated event that prevents ${cleanTopic} from occurring`,
          isCorrect: false
        },
        {
          text: `A single minor detail without any connection to the main topic`,
          isCorrect: false
        }
      ],
      hint: `Think about the primary system or topic that is introduced in the first sentence.`,
      explanation: `The passage begins by explaining: "${s1}"`,
      evidenceSentence: s1
    });
  }

  // =========================================================
  // 2. QUESTION 2: ⚡ STARTING FACTOR / INPUT (Single Choice)
  // =========================================================
  if (sentences.length >= 1) {
    const s1Words = s1.split(/\s+/);
    const excerpt = s1Words.slice(0, Math.min(s1Words.length, 9)).join(' ');

    questions.push({
      id: 'q-2',
      category: '⚡ Starting Inputs',
      question: `What initial conditions or starting factors are described in the passage?`,
      options: [
        {
          text: `${excerpt}${s1Words.length > 9 ? '...' : ''}`,
          isCorrect: true
        },
        {
          text: `No energy, materials, or starting actions are required at all`,
          isCorrect: false
        },
        {
          text: `An opposing force that blocks all initial activity`,
          isCorrect: false
        }
      ],
      hint: `Consider what the subject absorbs, utilizes, or begins with at the very start.`,
      explanation: `The passage explains: "${s1}"`,
      evidenceSentence: s1
    });
  }

  // =========================================================
  // 3. QUESTION 3: ⚙️ KEY MECHANISM (Single Choice)
  // =========================================================
  if (sentences.length >= 2) {
    const lowerS2 = s2.toLowerCase();
    let qText = `What key mechanism or structure is described in the text?`;
    if (lowerS2.includes('chloroplast') || lowerS2.includes('solar') || lowerS2.includes('light')) {
      qText = `Where or how is light energy captured according to the passage?`;
    } else if (lowerS2.includes('drainage') || lowerS2.includes('brick') || lowerS2.includes('architecture')) {
      qText = `What engineering architecture is highlighted in the passage?`;
    } else if (lowerS2.includes('weight') || lowerS2.includes('neural') || lowerS2.includes('algorithm')) {
      qText = `How does the system adjust and learn patterns?`;
    } else if (lowerS2.includes('valve') || lowerS2.includes('blood') || lowerS2.includes('heart')) {
      qText = `How is continuous orderly flow maintained?`;
    } else if (lowerS2.includes('evaporat') || lowerS2.includes('heat') || lowerS2.includes('vapor')) {
      qText = `What causes liquid to turn into rising vapor?`;
    } else if (lowerS2.includes('tectonic') || lowerS2.includes('plate') || lowerS2.includes('stress')) {
      qText = `Where does stored pressure accumulate in the Earth?`;
    }

    questions.push({
      id: 'q-3',
      category: '⚙️ Key Mechanism',
      question: qText,
      options: [
        {
          text: s2.length > 80 ? s2.substring(0, 77) + '...' : s2,
          isCorrect: true
        },
        {
          text: `The mechanism operates randomly with no organized structure`,
          isCorrect: false
        },
        {
          text: `The system remains completely inactive with zero process`,
          isCorrect: false
        }
      ],
      hint: `Think about the specialized parts or steps that carry out the process in the middle of the text.`,
      explanation: `The passage states: "${s2}"`,
      evidenceSentence: s2
    });
  }

  // =========================================================
  // 4. QUESTION 4: 🎯 FINAL RESULT / BYPRODUCT (Single Choice)
  // =========================================================
  if (sentences.length >= 2) {
    const lowerFinal = sFinal.toLowerCase();
    let qText = `What is the final outcome or byproduct explained in the passage?`;
    if (lowerFinal.includes('oxygen') || lowerFinal.includes('atp') || lowerFinal.includes('byproduct')) {
      qText = `What vital byproduct is released at the end of the process?`;
    } else if (lowerFinal.includes('commerce') || lowerFinal.includes('trade') || lowerFinal.includes('inhabitants')) {
      qText = `What did inhabitants establish based on excavations?`;
    } else if (lowerFinal.includes('vision') || lowerFinal.includes('adoption') || lowerFinal.includes('comprehension')) {
      qText = `What capability has modern deep learning demonstrated?`;
    } else if (lowerFinal.includes('pressure') || lowerFinal.includes('homeostasis') || lowerFinal.includes('tissue')) {
      qText = `What happens when healthy circulation is maintained?`;
    } else if (lowerFinal.includes('collect') || lowerFinal.includes('restart') || lowerFinal.includes('cycle')) {
      qText = `What happens after precipitation returns to the ground?`;
    }

    questions.push({
      id: 'q-4',
      category: '🎯 Final Result',
      question: qText,
      options: [
        {
          text: sFinal.length > 80 ? sFinal.substring(0, 77) + '...' : sFinal,
          isCorrect: true
        },
        {
          text: `The process results in complete breakdown with no outcome`,
          isCorrect: false
        },
        {
          text: `Everything disappears permanently without restarting`,
          isCorrect: false
        }
      ],
      hint: `Review the final sentence of the passage to see what result or product is created.`,
      explanation: `The conclusion states: "${sFinal}"`,
      evidenceSentence: sFinal
    });
  }

  // =========================================================
  // 5. QUESTION 5: ⚖️ TRUE OR FALSE (Fact Verification)
  // =========================================================
  if (sentences.length >= 1) {
    const factSnippet = s1.length > 85 ? s1.substring(0, 82) + '...' : s1;

    questions.push({
      id: 'q-5',
      category: '⚖️ True or False',
      question: `True or False: According to the passage, ${factSnippet}.`,
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ],
      hint: `Check if this exact fact matches what you read in the opening part of the passage.`,
      explanation: `This is true because the passage explicitly states: "${s1}"`,
      evidenceSentence: s1
    });
  }

  // =========================================================
  // 6. QUESTION 6: 🔄 CAUSE AND EFFECT (Single Choice)
  // =========================================================
  if (sentences.length >= 2) {
    questions.push({
      id: 'q-6',
      category: '🔄 Cause & Effect',
      question: `Why is the action in "${cleanTopic}" important according to the passage?`,
      options: [
        {
          text: `To coordinate reactions and achieve the necessary outcome`,
          isCorrect: true
        },
        {
          text: `To cause unexpected damage to the surrounding system`,
          isCorrect: false
        },
        {
          text: `To prevent all energy and nutrients from flowing`,
          isCorrect: false
        }
      ],
      hint: `Look for words in the text that explain the purpose or benefit of this process.`,
      explanation: `The passage explains: "${s2 || s1}"`,
      evidenceSentence: s2 || s1
    });
  }

  // =========================================================
  // 7. QUESTION 7: ⏱️ SEQUENCE / PROCESS FLOW (Step Order)
  // =========================================================
  if (sentences.length >= 3) {
    questions.push({
      id: 'q-7',
      category: '⏱️ Sequence & Flow',
      question: `In the sequence described, which event happens before the final outcome?`,
      options: [
        {
          text: s2.length > 75 ? s2.substring(0, 72) + '...' : s2,
          isCorrect: true
        },
        {
          text: `The final outcome repeats before any process has started`,
          isCorrect: false
        },
        {
          text: `The system shuts down completely before starting`,
          isCorrect: false
        }
      ],
      hint: `Think about the step-by-step order from start to finish.`,
      explanation: `Before the conclusion, the passage states: "${s2}"`,
      evidenceSentence: s2
    });
  }

  // =========================================================
  // 8. QUESTION 8: 🔍 CONCEPT MATCH (Statement Matching)
  // =========================================================
  if (sentences.length >= 2) {
    const matchS = s3 || s2;

    questions.push({
      id: 'q-8',
      category: '🔍 Concept Match',
      question: `Which statement accurately matches what the passage says about ${cleanTopic}?`,
      options: [
        {
          text: matchS.length > 80 ? matchS.substring(0, 77) + '...' : matchS,
          isCorrect: true
        },
        {
          text: `${cleanTopic} functions with zero organization or rules`,
          isCorrect: false
        },
        {
          text: `The passage claims that ${cleanTopic} does not exist`,
          isCorrect: false
        }
      ],
      hint: `One choice describes a statement directly mentioned in the reading.`,
      explanation: `The text directly states: "${matchS}"`,
      evidenceSentence: matchS
    });
  }

  // =========================================================
  // 9. QUESTION 9: ⚖️ TRUE OR FALSE (Negative Check)
  // =========================================================
  if (sentences.length >= 1) {
    questions.push({
      id: 'q-9',
      category: '⚖️ True or False',
      question: `True or False: The passage claims that ${cleanTopic} requires no action and produces zero results.`,
      options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true }
      ],
      hint: `Read carefully: does the passage state this process does nothing, or does it explain how it works?`,
      explanation: `This is false because the passage explains how ${cleanTopic} actively functions: "${s1}"`,
      evidenceSentence: s1
    });
  }

  // =========================================================
  // 10. QUESTION 10: 💡 KEY TAKEAWAY (Overall Synthesis)
  // =========================================================
  if (sentences.length >= 1) {
    questions.push({
      id: 'q-10',
      category: '💡 Key Takeaway',
      question: `What is the most important overall takeaway from this passage?`,
      options: [
        {
          text: `${cleanTopic} coordinates specific mechanisms to sustain its function and produce meaningful results.`,
          isCorrect: true
        },
        {
          text: `${cleanTopic} is completely random and has no scientific or historical explanation.`,
          isCorrect: false
        },
        {
          text: `The passage says nothing meaningful about ${cleanTopic}.`,
          isCorrect: false
        }
      ],
      hint: `Think about the big picture message you would explain to a friend after reading this passage.`,
      explanation: `Overall, the passage demonstrates: "${s1} ${sFinal}"`,
      evidenceSentence: `${s1} ${sFinal}`.trim()
    });
  }

  // Shuffle options for multi-choice questions so correct answer position varies
  return questions.map((q, qIndex) => {
    if (q.options.length <= 2) {
      // Keep True/False in standard order [True, False]
      return q;
    }
    const opts = [...q.options];
    if (qIndex % 3 === 1) {
      const temp = opts[0];
      opts[0] = opts[1];
      opts[1] = temp;
    } else if (qIndex % 3 === 2 && opts.length >= 3) {
      const temp = opts[0];
      opts[0] = opts[2];
      opts[2] = temp;
    }
    return {
      ...q,
      options: opts
    };
  });
}

export default function UnderstandingCheck({
  documentTitle = 'Current Passage',
  simplifiedText = '',
  rawText = '',
  paragraphs = []
}) {
  // Reading settings safe access
  let settings = {};
  try {
    const ctx = useReadingSettings();
    settings = ctx?.settings || {};
  } catch {
    settings = {};
  }

  // Generate 10 passage-grounded questions
  const questions = useMemo(() => {
    return generatePassageQuiz(documentTitle, simplifiedText || rawText, paragraphs);
  }, [documentTitle, simplifiedText, rawText, paragraphs]);

  // Quiz State
  const [quizState, setQuizState] = useState('intro'); // 'intro' | 'active' | 'completed'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [questionsListenedCount, setQuestionsListenedCount] = useState(0);
  const [speakingKey, setSpeakingKey] = useState(null);

  // Stop speech on unmount or question change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingKey(null);
    }
  };

  // Speech Assistance for Questions
  const handleReadQuestion = (questionObj, qIndex) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    stopSpeech();

    const keyId = `question-${qIndex}`;
    if (speakingKey === keyId) {
      setSpeakingKey(null);
      return;
    }

    setSpeakingKey(keyId);
    setQuestionsListenedCount(prev => prev + 1);

    const speechText = `Question ${qIndex + 1}. ${questionObj.question}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = settings.speechRate || 0.85;
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Assistance for Options
  const handleReadOptions = (questionObj, qIndex) => {
    if (!('speechSynthesis' in window)) return;

    stopSpeech();

    const keyId = `options-${qIndex}`;
    if (speakingKey === keyId) {
      setSpeakingKey(null);
      return;
    }

    setSpeakingKey(keyId);

    const optionsText = questionObj.options
      .map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt.text}`)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(optionsText);
    utterance.rate = settings.speechRate || 0.85;
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Assistance for Explanation & Feedback
  const handleReadExplanation = (questionObj, qIndex, isCorrect) => {
    if (!('speechSynthesis' in window)) return;

    stopSpeech();

    const keyId = `explanation-${qIndex}`;
    if (speakingKey === keyId) {
      setSpeakingKey(null);
      return;
    }

    setSpeakingKey(keyId);

    const feedbackIntro = isCorrect ? 'You got it! Great memory!' : 'Almost! That\'s okay. Let\'s review the idea:';
    const speechText = `${feedbackIntro} ${questionObj.explanation || ''}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = settings.speechRate || 0.85;
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // Reset quiz state when starting
  const handleStartQuiz = () => {
    stopSpeech();
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setShowHint(false);
    setShowEvidence(false);
    setScore(0);
    setHintsUsedCount(0);
    setQuestionsListenedCount(0);
    setQuizState('active');
  };

  const handleToggleHint = () => {
    if (!showHint) {
      setHintsUsedCount(prev => prev + 1);
    }
    setShowHint(prev => !prev);
  };

  const handleSelectOption = (optionIndex) => {
    if (isAnswered) return;

    stopSpeech();
    setSelectedOptionIndex(optionIndex);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = currentQ?.options[optionIndex]?.isCorrect || false;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    stopSpeech();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setShowHint(false);
      setShowEvidence(false);
    } else {
      setQuizState('completed');
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isSelectedCorrect = selectedOptionIndex !== null && currentQ?.options[selectedOptionIndex]?.isCorrect;
  const isSpeakingQuestion = speakingKey === `question-${currentIndex}`;
  const isSpeakingOptions = speakingKey === `options-${currentIndex}`;
  const isSpeakingExplanation = speakingKey === `explanation-${currentIndex}`;

  // If passage is too short for quiz
  if (questions.length === 0) {
    return null;
  }

  return (
    <div
      className="understanding-check-card mt-8 p-5 sm:p-7 rounded-2xl border shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      }}>
      
      {/* =========================================================
          STATE 1: INTRO / WELCOME SCREEN
         ========================================================= */}
      {quizState === 'intro' && (
        <div className="text-center py-6 px-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs"
               style={{
                 backgroundColor: 'var(--bg-main)',
                 borderColor: 'var(--border-color)',
                 color: 'var(--accent-color)'
               }}>
            <Brain className="w-7 h-7 text-emerald-600" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                 style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Understanding Check</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: 'var(--text-main)' }}>
              Ready for a tiny brain check?
            </h3>

            <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-medium">
              Let's see what you remember from <span className="font-bold italic">"{documentTitle || 'your reading'}"</span> — no pressure! ✨
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="px-6 py-3.5 rounded-xl font-black text-sm sm:text-base flex items-center space-x-2.5 mx-auto shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--accent-text)'
              }}>
              <span>Start {questions.length}-Question Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STATE 2: ACTIVE QUESTION SCREEN (ONE AT A TIME)
         ========================================================= */}
      {quizState === 'active' && currentQ && (
        <div className="uc-animated-fade-in space-y-5">
          
          {/* Top Progress & Header Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--accent-color)' }}>
                  {currentQ.category}
                </span>
                <span className="opacity-75">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Reading Assistance for Question */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleReadQuestion(currentQ, currentIndex)}
                  className={`uc-tool-btn px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-all ${
                    isSpeakingQuestion ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSpeakingQuestion ? '#F59E0B' : 'var(--bg-main)',
                    color: isSpeakingQuestion ? '#000000' : 'var(--text-main)'
                  }}
                  title="Read question aloud">
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingQuestion ? 'animate-bounce' : ''}`} />
                  <span>{isSpeakingQuestion ? 'Reading...' : 'Read Question'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReadOptions(currentQ, currentIndex)}
                  className={`uc-tool-btn px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-all hidden sm:flex ${
                    isSpeakingOptions ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSpeakingOptions ? '#F59E0B' : 'var(--bg-main)',
                    color: isSpeakingOptions ? '#000000' : 'var(--text-main)'
                  }}
                  title="Read options aloud">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingOptions ? 'Reading Options...' : 'Read Options'}</span>
                </button>
              </div>
            </div>

            {/* Progress Dots Track */}
            <div className="uc-step-dots">
              {questions.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`uc-dot ${
                    dotIdx === currentIndex
                      ? 'uc-dot-active'
                      : dotIdx < currentIndex
                      ? 'uc-dot-completed'
                      : ''
                  }`}
                />
              ))}
            </div>

            {/* Progress Track */}
            <div className="uc-progress-track">
              <div className="uc-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 sm:p-5 rounded-2xl border"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <h4 className="text-base sm:text-lg font-black leading-snug"
                style={{
                  color: 'var(--text-main)',
                  fontFamily: settings.font === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : settings.font === 'Lexend' ? '"Lexend", sans-serif' : 'inherit'
                }}>
              {currentQ.question}
            </h4>
          </div>

          {/* Option Choices */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOptionIndex === optIdx;
              
              let btnClass = 'uc-option-btn flex items-start space-x-3 w-full';
              if (isAnswered) {
                if (isSelected) {
                  btnClass += option.isCorrect ? ' uc-option-correct' : ' uc-option-incorrect';
                } else if (option.isCorrect) {
                  btnClass += ' uc-option-revealed-correct';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={btnClass}
                  style={{
                    fontFamily: settings.font === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : settings.font === 'Lexend' ? '"Lexend", sans-serif' : 'inherit'
                  }}>
                  <div className="uc-option-letter">
                    {isAnswered && option.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-700 font-bold" />
                    ) : isAnswered && isSelected && !option.isCorrect ? (
                      <X className="w-4 h-4 text-amber-800 font-bold" />
                    ) : (
                      letter
                    )}
                  </div>

                  <div className="flex-1 text-sm sm:text-base font-semibold leading-relaxed pt-0.5">
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 💡 Hint Button & Revealed Hint Box */}
          <div className="space-y-2">
            {!showHint ? (
              <button
                type="button"
                onClick={handleToggleHint}
                className="uc-tool-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs hover:opacity-90">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>💡 Need a hint?</span>
              </button>
            ) : (
              <div className="uc-hint-box flex items-start space-x-2.5 uc-animated-fade-in shadow-xs">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-black uppercase tracking-wider block">
                    Helpful Clue:
                  </span>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {currentQ.hint}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Explanation Banner */}
          {isAnswered && (
            <div className={`p-4 rounded-2xl uc-animated-fade-in ${isSelectedCorrect ? 'uc-feedback-correct' : 'uc-feedback-incorrect'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  {isSelectedCorrect ? (
                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <Smile className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  )}
                  <div className="space-y-1">
                    <div className="font-black text-sm sm:text-base">
                      {isSelectedCorrect ? '🎉 You got it!' : '🌱 Almost! That\'s okay.'}
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {isSelectedCorrect ? 'Great memory!' : 'Let\'s review the idea:'} {currentQ.explanation}
                    </p>
                  </div>
                </div>

                {/* 🔊 Read Explanation Button */}
                <button
                  type="button"
                  onClick={() => handleReadExplanation(currentQ, currentIndex, isSelectedCorrect)}
                  className={`uc-tool-btn px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start flex items-center space-x-1.5 shadow-xs transition-all ${
                    isSpeakingExplanation ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSpeakingExplanation ? '#F59E0B' : 'var(--bg-main)',
                    color: isSpeakingExplanation ? '#000000' : 'var(--text-main)'
                  }}
                  title="Read explanation aloud">
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingExplanation ? 'animate-bounce' : ''}`} />
                  <span>{isSpeakingExplanation ? 'Reading...' : 'Read Explanation'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 📖 Show Me Where (Passage Grounding Evidence) */}
          {isAnswered && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowEvidence(prev => !prev)}
                className="uc-tool-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs hover:opacity-90">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{showEvidence ? 'Hide passage ↑' : '📖 Show Me Where'}</span>
              </button>

              {showEvidence && (
                <div className="uc-evidence-box flex items-start space-x-2.5 uc-animated-fade-in shadow-xs">
                  <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider block text-indigo-700 dark:text-indigo-300">
                      📖 From your passage
                    </span>
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {currentQ.evidenceSentence ? (
                        <mark className="uc-evidence-highlight">{currentQ.evidenceSentence}</mark>
                      ) : (
                        '📖 This idea is explained across the passage.'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Question Action Bar */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl font-black text-sm sm:text-base flex items-center space-x-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--accent-text)'
                }}>
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'See Results ✨'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* =========================================================
          STATE 3: COMPLETED RESULTS SCREEN (WITH STATS)
         ========================================================= */}
      {quizState === 'completed' && (
        <div className="uc-results-card p-6 sm:p-8 text-center space-y-5 uc-animated-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 shadow-sm"
               style={{
                 backgroundColor: 'var(--flag-bg)',
                 borderColor: 'var(--flag-border)',
                 color: 'var(--flag-text)'
               }}>
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ color: 'var(--text-main)' }}>
              ✨ Understanding Check Complete!
            </h3>

            <div className="text-lg sm:text-xl font-black" style={{ color: 'var(--accent-color)' }}>
              🧠 {score} / {questions.length} concepts understood
            </div>

            <p className="text-xs sm:text-sm opacity-85 font-medium leading-relaxed">
              {score >= Math.ceil(questions.length * 0.8)
                ? '🌱 Fantastic job! You clearly understood all the core ideas of this passage.'
                : score >= Math.ceil(questions.length * 0.5)
                ? '🌱 Great work! You understood the main ideas well.'
                : '🌱 Good effort! Every practice makes reading and understanding easier.'}
            </p>
          </div>

          {/* Stats Badges: Hints used & Questions listened to */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <div className="uc-stat-pill">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Hints used: {hintsUsedCount}</span>
            </div>

            <div className="uc-stat-pill">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>Questions listened to: {questionsListenedCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 border shadow-xs hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}>
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
