import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronLeft, Columns, Copy, Printer, RotateCcw, Sparkles, X } from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import StatsCard from './StatsCard';
import WordModal from './WordModal';
import UnderstandingCheck from './UnderstandingCheck';

const FONT_FAMILIES = {
  OpenDyslexic: '"OpenDyslexic", sans-serif',
  Lexend: '"Lexend", sans-serif',
  Atkinson: '"Atkinson Hyperlegible", sans-serif',
  'Comic Neue': '"Comic Neue", cursive',
  Inter: '"Inter", sans-serif'
};

function stripPunctuation(value = '') {
  return value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function splitSyllables(word, supplied = []) {
  if (supplied?.length) return supplied;
  const clean = stripPunctuation(word);
  if (!clean) return [];
  const matches = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy](?=[^aeiouy]|$))?/gi);
  return matches?.filter(Boolean) || [clean];
}

export default function ReadingView({ document = {}, onBack, onReSimplify, onOpenSettings }) {
  const { settings, updateSetting } = useReadingSettings();
  const [viewMode, setViewMode] = useState('simplified');
  const [activeWordData, setActiveWordData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showGlossary, setShowGlossary] = useState(true);
  const [localSimplifiedText, setLocalSimplifiedText] = useState('');

  useEffect(() => {
    setLocalSimplifiedText(document?.simplifiedText || '');
  }, [document?._id, document?.simplifiedText]);

  const {
    title = 'Current Document',
    paragraphs = [],
    difficultWords = [],
    readabilityScore = {},
    simplificationLevel = 'moderate',
    rawText = '',
    simplifiedText = ''
  } = document;


  const difficultWordsMap = useMemo(() => {
    const map = new Map();
    difficultWords.forEach((dw) => {
      if (dw?.word) map.set(stripPunctuation(dw.word).toLowerCase(), dw);
      if (dw?.originalWord) map.set(stripPunctuation(dw.originalWord).toLowerCase(), dw);
    });
    return map;
  }, [difficultWords]);

  const localParagraphs = localSimplifiedText.split(/\n\s*\n/);
  const displayedText = viewMode === 'original' ? rawText : localSimplifiedText;

  const handleWordClick = (word, entry) => {
    const clean = stripPunctuation(word);
    const key = clean.toLowerCase();
    const dw = entry || difficultWordsMap.get(key);
    setActiveWordData(dw || {
      word: clean,
      originalWord: clean,
      simplifiedWord: clean,
      syllables: splitSyllables(clean),
      definition: 'No additional definition is available for this word.',
      synonyms: []
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedText || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReplaceWord = (originalWord, simplerWord) => {
    if (!simplerWord || !originalWord) return;
    // This is intentionally local: it updates the visible reading text without
    // pretending to modify the server document.
    const escaped = originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replacement = localSimplifiedText.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), simplerWord);
    if (replacement !== localSimplifiedText) setLocalSimplifiedText(replacement);
  };

  const renderWord = (token, pIdx, tIdx) => {
    const clean = stripPunctuation(token);
    if (!clean) return <React.Fragment key={`${pIdx}-${tIdx}`}>{token}</React.Fragment>;

    const lower = clean.toLowerCase();
    const entry = difficultWordsMap.get(lower);
    const syllables = splitSyllables(clean, entry?.syllables);
    const bionicLength = Math.max(1, Math.ceil(clean.length * 0.45));
    const content = settings.bionicMode ? (
      <>
        <strong className="bionic-fixation">{token.slice(0, bionicLength)}</strong>{token.slice(bionicLength)}
      </>
    ) : token;

    const wrapped = entry ? (
      <button
        type="button"
        className="difficult-word-badge mx-0.5"
        onClick={() => handleWordClick(clean, entry)}
        title="Open word meaning, syllables and simpler replacement"
        aria-label={`Open details for ${clean}`}
      >
        {content}
      </button>
    ) : (
      <span className="inline-block">{content}</span>
    );

    if (!settings.syllableDots || !entry) return <React.Fragment key={`${pIdx}-${tIdx}`}>{wrapped}</React.Fragment>;

    const leading = token.match(/^[^\p{L}\p{N}]*/u)?.[0] || '';
    const trailing = token.match(/[^\p{L}\p{N}]*$/u)?.[0] || '';
    return (
      <React.Fragment key={`${pIdx}-${tIdx}`}>
        {leading}
        <span className="inline-flex items-center">
          {syllables.map((syl, index) => (
            <React.Fragment key={`${syl}-${index}`}>
              {index > 0 && <span className="syllable-dot">·</span>}
              <span>{syl}</span>
            </React.Fragment>
          ))}
        </span>
        {trailing}
      </React.Fragment>
    );
  };

  const renderParagraph = (paragraph, pIdx, original = false) => {
    const text = original ? (paragraph.text || '') : (localParagraphs[pIdx] || paragraph.simplifiedText || paragraph.text || '');
    const tokens = text.split(/(\s+|[.,!?;:"'()[\]{}])/);
    return (
      <p
        key={pIdx}
        className="transition-all"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineSpacing,
          letterSpacing: `${settings.letterSpacing}em`,
          wordSpacing: `${settings.wordSpacing}em`,
          fontFamily: FONT_FAMILIES[settings.font] || FONT_FAMILIES.Inter,
          marginBottom: `${settings.fontSize * 1.15}px`
        }}
      >
        {tokens.map((token, tIdx) => renderWord(token, pIdx, tIdx))}
      </p>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-2 rounded-xl border hover:opacity-80" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }} aria-label="Back to input">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black truncate">{title}</h1>
            <p className="text-xs opacity-75">Dyslexia-friendly reading workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            {[
              ['simplified', 'Simplified'],
              ['original', 'Original'],
              ['split', 'Side-by-Side']
            ].map(([id, label]) => (
              <button key={id} onClick={() => setViewMode(id)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: viewMode === id ? 'var(--accent-color)' : 'transparent', color: viewMode === id ? 'var(--accent-text)' : 'var(--text-main)' }}>
                {id === 'split' && <Columns className="w-3 h-3 inline mr-1" />}{label}
              </button>
            ))}
          </div>
          <button onClick={handleCopy} className="p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }} title="Copy reading text">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={() => window.print()} className="p-2 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }} title="Print reading page">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={onOpenSettings} className="px-3 py-2 rounded-xl border text-xs font-bold" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            Reading settings
          </button>
        </div>
      </div>

      <StatsCard readabilityScore={readabilityScore} paragraphs={paragraphs} simplificationLevel={simplificationLevel} />

      <section className="mt-5 rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
            <div>
              <h2 className="font-black text-base">Reading Text</h2>
              <p className="text-xs opacity-70">Use the controls below to personalize visual presentation.</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full border font-bold" style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
            {viewMode === 'original' ? 'Original text' : 'Simplified text'}
          </span>
        </div>

        {viewMode === 'split' ? (
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-xs font-black uppercase tracking-wider mb-4 opacity-70">Original</div>
              {paragraphs.map((p, idx) => renderParagraph(p, idx, true))}
            </div>
            <div className="p-5">
              <div className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: 'var(--accent-color)' }}>Simplified</div>
              {paragraphs.map((p, idx) => renderParagraph(p, idx, false))}
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-7 max-w-4xl mx-auto">
            {paragraphs.length ? paragraphs.map((p, idx) => renderParagraph(p, idx, viewMode === 'original')) : (
              <p style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineSpacing }}>{displayedText}</p>
            )}
          </div>
        )}
      </section>

      {difficultWords.length > 0 && (
        <section className="mt-6 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={() => setShowGlossary(v => !v)} className="w-full p-5 flex items-center justify-between text-left">
            <div>
              <h3 className="font-black flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />Difficult words ({difficultWords.length})</h3>
              <p className="text-xs opacity-70 mt-1">Highlighted words can be opened for syllables, definitions and simpler replacements.</p>
            </div>
            <span className="text-xs font-bold">{showGlossary ? 'Hide' : 'Show'}</span>
          </button>
          {showGlossary && (
            <div className="px-5 pb-5 flex flex-wrap gap-2">
              {difficultWords.map((dw, i) => {
                const word = dw.originalWord || dw.word;
                return <button key={`${word}-${i}`} type="button" onClick={() => handleWordClick(word, dw)} className="difficult-word-badge px-3 py-1.5" title={`Open details for ${word}`}>{word}</button>;
              })}
            </div>
          )}
        </section>
      )}

      <UnderstandingCheck documentTitle={title} simplifiedText={localSimplifiedText} rawText={rawText} paragraphs={paragraphs} />

      {activeWordData && (
        <WordModal wordData={activeWordData} onClose={() => setActiveWordData(null)} onReplaceWord={handleReplaceWord} />
      )}
    </div>
  );
}
