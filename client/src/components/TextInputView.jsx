import React, { useState } from 'react';
import { Sparkles, Clipboard, Trash2, ArrowRight, BookOpen, Layers, Zap } from 'lucide-react';
import { SAMPLE_TEXTS } from '../data/sampleTexts';
import { useReadingSettings } from '../context/ReadingSettingsContext';

export default function TextInputView({ onSubmitText, isLoading }) {
  const { settings, updateSetting } = useReadingSettings();
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [selectedSampleId, setSelectedSampleId] = useState(SAMPLE_TEXTS[0].id);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleSelectSample = (sample) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.text);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setSelectedSampleId(null);
      }
    } catch (err) {
      alert('Clipboard access permission denied. Please paste directly using Ctrl+V.');
    }
  };

  const handleClear = () => {
    setInputText('');
    setSelectedSampleId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const matchedSample = SAMPLE_TEXTS.find(s => s.id === selectedSampleId);
    onSubmitText({
      text: inputText,
      title: matchedSample ? matchedSample.title : null,
      simplificationLevel: settings.simplificationLevel
    });
  };

  const levels = [
    { id: 'light', label: 'Light', desc: 'Gentle vocabulary touchups' },
    { id: 'moderate', label: 'Moderate', desc: 'Standard sentence splitting & plain synonyms (Recommended)' },
    { id: 'high', label: 'High', desc: 'Ultra-simplified bite-sized sentences' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Intro Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border"
             style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Dyslexia Simplification Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Transform Dense Content Into Accessible Reading
        </h1>
        <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
          Type or paste text below, or pick a sample passage. Our rule-based NLP simplifies complex sentences, decomposes multi-syllable terms, and formats everything for comfortable reading.
        </p>
      </div>

      {/* Preset Sample Text Cards */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2.5 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Choose a Sample Academic Passage to Test Instantly</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {SAMPLE_TEXTS.map(sample => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 shadow-md font-bold'
                    : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--card-hover)' : 'var(--card-bg)',
                  borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                  color: 'var(--text-main)'
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)' }}>
                    {sample.category}
                  </span>
                  <span className="text-[10px] opacity-60 font-semibold">{sample.difficulty}</span>
                </div>
                <div className="text-xs font-bold line-clamp-2">{sample.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl border shadow-md space-y-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}>
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b pb-3"
             style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center space-x-2 text-xs font-bold opacity-75">
            <BookOpen className="w-4 h-4" />
            <span>Reading Passage Text</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold opacity-75 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedSampleId(null);
          }}
          placeholder="Paste or type any dense text, textbook chapter, or article here..."
          className="w-full p-4 rounded-xl border text-base sm:text-lg resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed transition-all shadow-inner"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            fontFamily: settings.font === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : settings.font === 'Lexend' ? '"Lexend", sans-serif' : 'inherit'
          }}
        />

        {/* Word / Char Counters */}
        <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
          <div className="space-x-3">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{charCount} characters</span>
          </div>
          <div className="font-bold" style={{ color: 'var(--accent-color)' }}>
            ~{Math.max(1, Math.ceil(wordCount / 130))} min read
          </div>
        </div>

        {/* Simplification Level Pill Selector */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2 block">
            Simplification Intensity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {levels.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => updateSetting('simplificationLevel', l.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.simplificationLevel === l.id
                    ? 'ring-2 ring-emerald-500 font-bold shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: settings.simplificationLevel === l.id ? 'var(--accent-color)' : 'var(--bg-main)',
                  color: settings.simplificationLevel === l.id ? 'var(--accent-text)' : 'var(--text-main)',
                  borderColor: 'var(--border-color)'
                }}>
                <div className="text-sm font-bold capitalize flex items-center justify-between">
                  <span>{l.label}</span>
                  {settings.simplificationLevel === l.id && <Zap className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`w-full py-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg transition-all ${
              isLoading || !inputText.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-95 hover:scale-[1.005] active:scale-[0.99]'
            }`}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--accent-text)'
            }}>
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Running NLP Simplification...</span>
              </>
            ) : (
              <>
                <span>Simplify & Start Reading</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

