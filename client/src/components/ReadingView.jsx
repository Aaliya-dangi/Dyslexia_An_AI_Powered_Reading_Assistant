import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Columns,
  BookOpen,
  Mic,
  Network,
  Check,
  ChevronLeft,
  Sliders,
  Printer,
  Copy,
  Layers,
  Ear
} from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import StatsCard from './StatsCard';
import WordModal from './WordModal';
import PronunciationModal from './PronunciationModal';
import VisualizationModal from './VisualizationModal';
import VisualUnderstanding from './VisualUnderstanding';
import FinalVisualReview from './FinalVisualReview';
import UnderstandingCheck from './UnderstandingCheck';
import { logReadingEvent } from '../services/api';

export default function ReadingView({
  document,
  onBack,
  onReSimplify,
  onOpenSettings
}) {
  const { settings, updateSetting } = useReadingSettings();

  // State
  const [viewMode, setViewMode] = useState('simplified'); // 'simplified' | 'original' | 'split'
  const [activeWordData, setActiveWordData] = useState(null);
  const [pronounceTarget, setPronounceTarget] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speakingWordKey, setSpeakingWordKey] = useState(null);

  // Audio / TTS state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);

  // Telemetry references
  const speechStartTimeRef = useRef(null);
  const pauseStartTimeRef = useRef(null);

  // Stop speech when unmounting or switching document
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [document?._id]);

  if (!document) return null;

  const {
    _id,
    title,
    paragraphs = [],
    difficultWords = [],
    readabilityScore,
    simplificationLevel = 'moderate',
    rawText = '',
    simplifiedText = ''
  } = document;

  // Map difficult words for fast lookup
  const difficultWordsMap = new Map();
  difficultWords.forEach(dw => {
    if (dw.word) difficultWordsMap.set(dw.word.toLowerCase(), dw);
  });

  // Handle word click
  const handleWordClick = (word, originalWord) => {
    const key = (word || '').toLowerCase();
    const entry = difficultWordsMap.get(key) || {
      word: key,
      originalWord: originalWord || word,
      simplifiedWord: key,
      syllables: [word],
      definition: 'A vocabulary term.',
      synonyms: []
    };

    setActiveWordData(entry);

    // Telemetry event for adaptive engine
    if (_id) {
      logReadingEvent(_id, {
        type: 'wordFlag',
        position: { word: key },
        currentLevel: simplificationLevel
      });
    }
  };

  /**
   * Quick direct slow pronunciation of a single word without opening modal
   */
  const handleQuickSlowPronounce = (e, wordToSpeak) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setSpeakingWordKey(wordToSpeak.toLowerCase());

    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
    utterance.rate = settings.wordAudioSpeed || 0.60; // Deliberately slow
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingWordKey(null);
    utterance.onerror = () => setSpeakingWordKey(null);

    window.speechSynthesis.speak(utterance);

    // Telemetry event
    if (_id) {
      logReadingEvent(_id, {
        type: 'wordPronounce',
        position: { word: wordToSpeak.toLowerCase() },
        currentLevel: simplificationLevel
      });
    }
  };

  // TTS Speech Synthesis Handlers
  const handlePlayTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    speechStartTimeRef.current = Date.now();

    const fullTextToRead = viewMode === 'original' ? rawText : simplifiedText;
    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.rate = settings.speechRate || 0.9;
    utterance.pitch = settings.speechPitch || 1.0;

    // Track word boundary event
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setActiveCharIndex(event.charIndex);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(-1);
      setActiveWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTTS = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      pauseStartTimeRef.current = Date.now();

      // Log pause event for adaptive tracking
      if (_id) {
        logReadingEvent(_id, {
          type: 'pause',
          durationMs: 1500,
          currentLevel: simplificationLevel
        });
      }
    }
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(-1);
      setActiveWordIndex(-1);
    }
  };

  const handleCopyText = () => {
    const textToCopy = viewMode === 'original' ? rawText : simplifiedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render a token with dyslexia aids (bionic bolds, syllable dots, difficult word buttons)
  const renderWordToken = (token, pIdx, tokenIdx) => {
    const clean = token.replace(/[^a-zA-Z]/g, '');
    if (!clean) return token;

    const lower = clean.toLowerCase();
    const isDifficult = difficultWordsMap.has(lower);

    // Bionic Reading Formatter
    const formatBionic = (w) => {
      if (!settings.bionicMode || w.length <= 1) return w;
      const fixationLength = Math.ceil(w.length * 0.45);
      const boldPart = w.substring(0, fixationLength);
      const restPart = w.substring(fixationLength);
      return (
        <span>
          <span className="bionic-fixation">{boldPart}</span>
          <span>{restPart}</span>
        </span>
      );
    };

    // If flagged difficult word
    if (isDifficult) {
      const dwEntry = difficultWordsMap.get(lower);
      return (
        <button
          key={`${pIdx}-${tokenIdx}`}
          type="button"
          onClick={() => handleWordClick(lower, dwEntry?.originalWord || clean)}
          className="difficult-word-badge mx-0.5"
          title={`Difficult word: ${clean} (Click for slow pronunciation, syllables & definition)`}>
          {formatBionic(token)}
        </button>
      );
    }

    return (
      <span key={`${pIdx}-${tokenIdx}`} className="inline-block">
        {formatBionic(token)}
      </span>
    );
  };

  // Render Paragraph
  const renderParagraph = (paragraph, pIdx, isOriginal = false) => {
    const text = isOriginal ? paragraph.text : paragraph.simplifiedText;
    const tokens = text.split(/(\s+|[.,!?;:"'()[\]{}])/);

    return (
      <p
        key={pIdx}
        className="transition-all leading-relaxed"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineSpacing,
          letterSpacing: `${settings.letterSpacing}em`,
          wordSpacing: `${settings.wordSpacing}em`,
          fontFamily:
            settings.font === 'OpenDyslexic'
              ? '"OpenDyslexic", sans-serif'
              : settings.font === 'Lexend'
              ? '"Lexend", sans-serif'
              : settings.font === 'Atkinson'
              ? '"Atkinson Hyperlegible", sans-serif'
              : settings.font === 'Comic Neue'
              ? '"Comic Neue", cursive'
              : '"Inter", sans-serif',
          marginBottom: `${settings.fontSize * 1.2}px`
        }}>
        {tokens.map((token, tIdx) => renderWordToken(token, pIdx, tIdx))}
      </p>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Top Bar: Back button, Title, View Switcher & Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b pb-4"
           style={{ borderColor: 'var(--border-color)' }}>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border hover:opacity-80 transition-opacity shadow-xs flex items-center space-x-1"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">New Text</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-black line-clamp-1">{title}</h1>
            <p className="text-xs opacity-75">Dyslexia-Optimized Reading Space</p>
          </div>
        </div>

        {/* View Mode Tabs (Simplified vs Original vs Split) */}
        <div className="flex items-center space-x-1 p-1 rounded-xl border self-stretch sm:self-auto justify-center"
             style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setViewMode('simplified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'simplified' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: viewMode === 'simplified' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'simplified' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            Simplified
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'original' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: viewMode === 'original' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'original' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            Original
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all hidden md:flex items-center space-x-1 ${
              viewMode === 'split' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: viewMode === 'split' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'split' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            <Columns className="w-3 h-3" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Secondary Tool Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowVisualization(true)}
            className="p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            title="Generate Visual Flowchart Concept Map">
            <Network className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">Visual Map</span>
          </button>

          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            title="Copy text">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            title="Print dyslexia-friendly formatted page">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Readability Score Analysis Card */}
      <StatsCard
        readabilityScore={readabilityScore}
        paragraphs={paragraphs}
        simplificationLevel={simplificationLevel}
      />

      {/* TTS Synchronized Audio Playback Controller */}
      <div className="sticky top-20 z-20 mb-6 p-4 rounded-2xl border shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3"
           style={{
             backgroundColor: 'var(--card-bg)',
             borderColor: 'var(--border-color)',
             color: 'var(--text-main)'
           }}>
        
        <div className="flex items-center space-x-3">
          {!isPlaying ? (
            <button
              onClick={handlePlayTTS}
              className="p-3 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}
              title="Listen to Narration with Synced Highlighting">
              <Play className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={handlePauseTTS}
              className="p-3 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 bg-amber-500 text-white"
              title="Pause Narration">
              <Pause className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleStopTTS}
            disabled={!isPlaying && !isPaused}
            className="p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1 shadow-xs hover:opacity-90 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Stop</span>
          </button>

          <div className="text-xs font-bold">
            {isPlaying ? (
              <span className="flex items-center space-x-1" style={{ color: 'var(--accent-color)' }}>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Reading Aloud ({settings.speechRate}x)</span>
              </span>
            ) : isPaused ? (
              <span className="text-amber-600">Narration Paused</span>
            ) : (
              <span className="opacity-75">Click Play for Audio Narration</span>
            )}
          </div>
        </div>

        {/* Speed Adjustment Buttons */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-bold uppercase opacity-60 mr-1 hidden sm:inline">Narration:</span>
          {[0.75, 0.9, 1.0, 1.25].map(rate => (
            <button
              key={rate}
              onClick={() => updateSetting('speechRate', rate)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                settings.speechRate === rate
                  ? 'ring-2 ring-emerald-500 font-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: settings.speechRate === rate ? 'var(--accent-color)' : 'var(--bg-main)',
                color: settings.speechRate === rate ? 'var(--accent-text)' : 'var(--text-main)',
                borderColor: 'var(--border-color)'
              }}>
              {rate}x
            </button>
          ))}
        </div>

      </div>

      {/* Main Reading Canvas */}
      <div className="p-6 sm:p-10 rounded-2xl border shadow-md transition-all duration-200"
           style={{
             backgroundColor: 'var(--card-bg)',
             borderColor: 'var(--border-color)',
             color: 'var(--text-main)'
           }}>
        
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Original Text */}
            <div className="border-r pr-0 md:pr-6" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-black uppercase tracking-wider opacity-60">Original Complex Text</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold border"
                      style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                  Grade {readabilityScore?.originalGrade || '12+'}
                </span>
              </div>
              <div className="space-y-4">
                {paragraphs.map((p, idx) => renderParagraph(p, idx, true))}
              </div>
            </div>

            {/* Right: Simplified Text */}
            <div className="pl-0 md:pl-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                  Dyslexia-Simplified Text
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold border"
                      style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
                  Grade {readabilityScore?.fleschKincaidGrade || '6'}
                </span>
              </div>
              <div className="space-y-4">
                {paragraphs.map((p, idx) => renderParagraph(p, idx, false))}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {paragraphs.map((p, idx) => renderParagraph(p, idx, viewMode === 'original'))}
          </div>
        )}

      </div>

      {/* Flagged Difficult Words Glossary Bottom Card */}
      {difficultWords && difficultWords.length > 0 && (
        <div className="mt-8 p-5 sm:p-6 rounded-2xl border shadow-sm transition-all duration-200"
             style={{
               backgroundColor: 'var(--card-bg)',
               borderColor: 'var(--border-color)',
               color: 'var(--text-main)'
             }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <h3 className="font-bold text-sm sm:text-base flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Difficult Vocabulary & Slow Voice Pronunciations ({difficultWords.length})</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full border font-bold flex items-center space-x-1"
                  style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <Ear className="w-3 h-3 text-purple-600" />
              <span>Slow Voice: {settings.wordAudioSpeed || 0.60}x</span>
            </span>
          </div>
          
          <p className="text-xs opacity-75 mb-4">
            Tap the speaker icon on any word to hear it pronounced slowly, or click the word to open its syllable breakdown and plain-English definition.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {difficultWords.map((dw, i) => {
              const wordText = dw.originalWord || dw.word;
              const isSpeakingThis = speakingWordKey === wordText.toLowerCase();
              return (
                <div
                  key={i}
                  className="flex items-center rounded-xl border shadow-xs transition-all overflow-hidden"
                  style={{
                    backgroundColor: 'var(--flag-bg)',
                    borderColor: isSpeakingThis ? '#F59E0B' : 'var(--flag-border)'
                  }}>
                  
                  {/* Quick Slow Speaker Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickSlowPronounce(e, wordText)}
                    title={`Hear "${wordText}" pronounced slowly`}
                    className={`p-2 border-r transition-all flex items-center justify-center ${
                      isSpeakingThis
                        ? 'bg-amber-400 text-amber-950 scale-110'
                        : 'hover:bg-amber-300/60'
                    }`}
                    style={{ borderColor: 'var(--flag-border)', color: 'var(--flag-text)' }}>
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-bounce' : ''}`} />
                  </button>

                  {/* Word Details Modal Opener */}
                  <button
                    type="button"
                    onClick={() => handleWordClick(dw.word, dw.originalWord)}
                    className="px-3 py-1.5 text-sm sm:text-base font-bold flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
                    style={{ color: 'var(--flag-text)' }}>
                    <span>{wordText}</span>
                    <span className="text-[10px] opacity-70 font-semibold">({dw.syllables?.length || 1} syl)</span>
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Understanding - Graphical Flow Representation */}
      <VisualUnderstanding
        documentTitle={title}
        simplifiedText={simplifiedText}
        rawText={rawText}
        paragraphs={paragraphs}
        difficultWords={difficultWords}
      />

      {/* 🖼️ Final Visual Review - Whole-Document Static Educational Infographic */}
      <FinalVisualReview
        documentTitle={title}
        rawText={rawText}
        simplifiedText={simplifiedText}
        paragraphs={paragraphs}
      />

      {/* 🧠 Understanding Check - Mini Quiz from active passage */}
      <UnderstandingCheck
        documentTitle={title}
        simplifiedText={simplifiedText}
        rawText={rawText}
        paragraphs={paragraphs}
      />

      {/* Interactive Word Modal Popup */}
      {activeWordData && (
        <WordModal
          wordData={activeWordData}
          onClose={() => setActiveWordData(null)}
          onOpenPronounce={(word) => setPronounceTarget(word)}
        />
      )}

      {/* Speech Pronunciation Modal Practice */}
      {pronounceTarget && (
        <PronunciationModal
          targetText={pronounceTarget}
          onClose={() => setPronounceTarget(null)}
        />
      )}

      {/* AI Visual Learning Modal */}
      {showVisualization && (
        <VisualizationModal
          documentId={_id}
          simplifiedText={simplifiedText}
          onClose={() => setShowVisualization(false)}
        />
      )}

    </div>
  );
}
