import React, { useMemo, useState } from 'react';
import { Award, BookOpen, Check, ChevronRight, Lightbulb, RotateCcw, Sparkles, X } from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import './UnderstandingCheck.css';

function buildQuestions(title, text, paragraphs) {
  const fullText = (text || paragraphs.map(p => p.simplifiedText || p.text || '').join(' ')).trim();
  if (fullText.split(/\s+/).length < 5) return [];

  const sentences = fullText.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 12);
  const topic = (title || 'this passage').replace(/^(Chapter|Section|Unit|Document|Passage)\s*\d*[:\-]?\s*/i, '').trim() || 'this passage';
  const first = sentences[0] || fullText;
  const second = sentences[1] || first;
  const keywords = [...new Set((fullText.toLowerCase().match(/[a-z]{6,}/g) || []))].filter(w => !/^(because|through|therefore|however|between|during|another|people|should|which|their|about)$/.test(w)).slice(0, 8);

  const questions = [
    { id: 'main', category: 'Main Idea', question: `What is the main idea of ${topic}?`, answer: first, hint: 'Look at the first sentence and the idea repeated across the passage.', evidence: first },
    { id: 'detail', category: 'Key Detail', question: 'Which statement is directly supported by the passage?', answer: second, hint: 'Choose the option that matches a detail stated in the text.', evidence: second }
  ];

  if (keywords[0]) {
    const word = keywords[0];
    const sentence = sentences.find(s => s.toLowerCase().includes(word)) || first;
    questions.push({ id: 'term', category: 'Vocabulary', question: `Which idea is associated with the word “${word}” in this passage?`, answer: sentence, hint: `Find “${word}” in the reading text and check the surrounding sentence.`, evidence: sentence });
  }
  if (sentences.length >= 3) {
    questions.push({ id: 'sequence', category: 'Understanding', question: 'Which statement best describes one of the ideas explained in the passage?', answer: sentences[2], hint: 'Compare each option with the passage rather than relying on memory alone.', evidence: sentences[2] });
  }
  return questions;
}

function makeOptions(question) {
  const correct = question.answer;
  const short = (s) => s.length > 115 ? `${s.slice(0, 112).trim()}…` : s;
  const alternatives = [
    'This idea is not discussed in the passage.',
    'The passage gives a different explanation for this idea.',
    'The text does not provide enough information to support this statement.'
  ];
  const list = [correct, ...alternatives];
  return list.sort(() => 0.5 - Math.random()).map((text, i) => ({ text: short(text), isCorrect: text === correct, id: `${question.id}-${i}` }));
}

export default function UnderstandingCheck({ documentTitle, simplifiedText, paragraphs = [] }) {
  const { settings } = useReadingSettings();
  const questions = useMemo(() => buildQuestions(documentTitle, simplifiedText, paragraphs), [documentTitle, simplifiedText, paragraphs]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const options = useMemo(() => (questions.length ? makeOptions(questions[index]) : []), [questions, index]);

  if (!questions.length) return null;

  const current = questions[index];

  const answer = (option) => {
    if (selected) return;
    setSelected(option);
    if (option.isCorrect) setScore(s => s + 1);
  };

  const next = () => {
    if (index >= questions.length - 1) setCompleted(true);
    else {
      setIndex(i => i + 1);
      setSelected(null);
      setShowHint(false);
      setShowEvidence(false);
    }
  };

  const restart = () => {
    setStarted(true); setIndex(0); setSelected(null); setScore(0); setCompleted(false); setShowHint(false); setShowEvidence(false);
  };

  if (!started) {
    return <section className="mt-8 p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-start justify-between gap-4">
        <div><div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>Understanding Check</div><h2 className="text-xl font-black mt-1">Check what you understood</h2><p className="text-sm opacity-75 mt-2 max-w-2xl">Answer a short set of questions based only on the reading passage. You can use hints and return to the passage whenever needed.</p></div>
        <BookOpen className="w-7 h-7 shrink-0" style={{ color: 'var(--accent-color)' }} />
      </div>
      <button onClick={() => setStarted(true)} className="mt-5 px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>Start Understanding Check <ChevronRight className="w-4 h-4" /></button>
    </section>;
  }

  if (completed) {
    return <section className="mt-8 p-7 rounded-2xl border text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)' }}><Award className="w-7 h-7" /></div>
      <h2 className="text-2xl font-black mt-4">Understanding Check Complete</h2>
      <div className="text-lg font-black mt-2" style={{ color: 'var(--accent-color)' }}>{score} / {questions.length} concepts understood</div>
      <p className="text-sm opacity-75 mt-2">Use the passage and hints as learning supports, not as a test of memory.</p>
      <button onClick={restart} className="mt-5 px-4 py-2.5 rounded-xl border font-bold text-sm inline-flex items-center gap-2" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><RotateCcw className="w-4 h-4" /> Try Again</button>
    </section>;
  }

  return <section className="mt-8 rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', fontFamily: settings.font === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : 'inherit' }}>
    <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>{current.category}</div><h3 className="text-lg font-black mt-1">Question {index + 1} of {questions.length}</h3></div><span className="text-xs font-bold opacity-70">{score} correct</span></div>
      <p className="mt-4 text-base sm:text-lg font-bold leading-relaxed">{current.question}</p>
    </div>
    <div className="p-5 space-y-3">
      {options.map((option, i) => {
        const chosen = selected === option;
        const cls = selected ? (option.isCorrect ? 'border-emerald-500 bg-emerald-50' : chosen ? 'border-amber-500 bg-amber-50' : '') : '';
        return <button key={option.id} type="button" disabled={!!selected} onClick={() => answer(option)} className={`w-full text-left p-4 rounded-xl border font-semibold transition-all ${cls}`} style={{ borderColor: selected && (option.isCorrect || chosen) ? undefined : 'var(--border-color)', backgroundColor: selected ? undefined : 'var(--bg-main)', color: 'var(--text-main)' }}><span className="inline-flex w-7 h-7 rounded-full items-center justify-center mr-3 text-xs font-black border" style={{ borderColor: 'var(--border-color)' }}>{selected && option.isCorrect ? <Check className="w-4 h-4" /> : selected && chosen ? <X className="w-4 h-4" /> : String.fromCharCode(65 + i)}</span>{option.text}</button>;
      })}

      <div className="pt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setShowHint(v => !v)} className="px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><Lightbulb className="w-4 h-4" /> {showHint ? 'Hide hint' : 'Need a hint?'}</button>
        {selected && <button type="button" onClick={() => setShowEvidence(v => !v)} className="px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><BookOpen className="w-4 h-4" /> {showEvidence ? 'Hide passage' : 'Show me where'}</button>}
      </div>

      {showHint && <div className="mt-3 p-3 rounded-xl border text-sm" style={{ backgroundColor: 'var(--flag-bg)', borderColor: 'var(--flag-border)' }}><strong>Hint:</strong> {current.hint}</div>}
      {selected && <div className="mt-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><div className="font-black">{selected.isCorrect ? 'Great job!' : 'Almost — review the passage.'}</div><p className="text-sm mt-1 leading-relaxed">{current.answer}</p></div>}
      {showEvidence && selected && <div className="mt-3 p-4 rounded-xl border text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><strong>From your passage:</strong> {current.evidence}</div>}

      {selected && <div className="flex justify-end pt-2"><button type="button" onClick={next} className="px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>{index === questions.length - 1 ? 'See Results' : 'Next Question'} <ChevronRight className="w-4 h-4" /></button></div>}
    </div>
  </section>;
}
