import React from 'react';
import {
  Type,
  Maximize2,
  Sparkles,
  Palette,
  Volume2,
  Eye,
  RotateCcw,
  Sliders,
  Check,
  X,
  Contrast,
  Gauge,
  Ear
} from 'lucide-react';
import {
  useReadingSettings,
  THEME_PRESETS,
  CONTRAST_MODES,
  WORD_SPEED_PRESETS
} from '../context/ReadingSettingsContext';

export default function SettingsBar({ isOpen, onClose, activeDocument, onReSimplify }) {
  const { settings, updateSetting, resetDefaults } = useReadingSettings();

  if (!isOpen) return null;

  const fontOptions = [
    { id: 'OpenDyslexic', name: 'OpenDyslexic (Dyslexia Weighted)', desc: 'Weighted bottom prevents letter flipping' },
    { id: 'Lexend', name: 'Lexend (High Reading Speed)', desc: 'Scientifically engineered for reading ease' },
    { id: 'Atkinson', name: 'Atkinson Hyperlegible', desc: 'Maximum character distinction' },
    { id: 'Comic Neue', name: 'Comic Neue (Friendly Sans)', desc: 'Distinct irregular casual glyphs' },
    { id: 'Inter', name: 'Inter (Clean Standard)', desc: 'Modern geometric sans' }
  ];

  const levels = [
    { id: 'light', name: 'Light', desc: 'Replaces extreme jargon only' },
    { id: 'moderate', name: 'Moderate', desc: 'Balanced simplification & sentence splitting' },
    { id: 'high', name: 'High', desc: 'Short bite-sized sentences & basic vocabulary' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl border-l flex flex-col backdrop-blur-md overflow-hidden transition-all animate-in slide-in-from-right duration-200"
         style={{
           backgroundColor: 'var(--card-bg)',
           borderColor: 'var(--border-color)',
           color: 'var(--text-main)'
         }}>
      
      {/* Drawer Header */}
      <div className="p-4 border-b flex items-center justify-between"
           style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <h2 className="font-extrabold text-base sm:text-lg">Dyslexia Reading Tools</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetDefaults}
            title="Reset all to recommended defaults"
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity text-xs flex items-center space-x-1 font-bold"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            aria-label="Close settings drawer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* 1. Color Themes (Dyslexia Color Tints) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>Background Tint & Color Palette</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {THEME_PRESETS.map(t => {
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateSetting('theme', t.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected ? 'ring-2 ring-emerald-500 font-bold shadow-sm scale-[1.01]' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: t.bg,
                    color: t.text,
                    borderColor: isSelected ? 'var(--accent-color)' : t.border
                  }}>
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full border shadow-xs shrink-0" style={{ backgroundColor: t.card, borderColor: t.border }} />
                    <div>
                      <div className="text-sm font-extrabold">{t.name}</div>
                      <div className="text-xs opacity-75 leading-tight">{t.desc}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Contrast Level Adjustment */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5 mb-2">
            <Contrast className="w-3.5 h-3.5 text-blue-600" />
            <span>Contrast Intensity</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CONTRAST_MODES.map(c => {
              const isSelected = settings.contrastMode === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => updateSetting('contrastMode', c.id)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                    isSelected ? 'font-bold ring-2 ring-emerald-500 shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-main)',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}>
                  <div className="text-xs font-bold">{c.name.split(' ')[0]}</div>
                  <div className="text-[10px] opacity-75 leading-tight">{c.name.split(' ')[1] || ''}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Voice Assistant: Slow Word Pronunciation Assistance */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-75 mb-2">
            <span className="flex items-center space-x-1.5">
              <Ear className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice: Slow Word Pronunciation</span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {WORD_SPEED_PRESETS.map(w => {
              const isSelected = (settings.wordAudioSpeed || 0.60) === w.value;
              return (
                <button
                  key={w.id}
                  onClick={() => updateSetting('wordAudioSpeed', w.value)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected ? 'ring-2 ring-emerald-500 font-bold shadow-xs' : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-main)',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}>
                  <div>
                    <div className="text-xs font-black">{w.label}</div>
                    <div className="text-[10px] opacity-80">{w.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Typography Selection */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5 mb-2">
            <Type className="w-3.5 h-3.5 text-amber-600" />
            <span>Dyslexia-Friendly Font Family</span>
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {fontOptions.map(f => {
              const isSelected = settings.font === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => updateSetting('font', f.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border transition-all flex items-center justify-between ${
                    isSelected ? 'font-extrabold ring-2 ring-emerald-500 shadow-xs' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-main)' : 'transparent',
                    borderColor: 'var(--border-color)',
                    fontFamily: f.id === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : f.id === 'Lexend' ? '"Lexend", sans-serif' : f.id === 'Atkinson' ? '"Atkinson Hyperlegible", sans-serif' : f.id === 'Comic Neue' ? '"Comic Neue", cursive' : '"Inter", sans-serif'
                  }}>
                  <div>
                    <div>{f.name}</div>
                    <div className="text-[11px] opacity-60 font-sans">{f.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Font Size, Line Height, Letter & Word Spacing */}
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-75">
            <span className="flex items-center space-x-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Text Spacing & Sizing</span>
            </span>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Font Size</span>
              <span className="font-bold">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="34"
              step="1"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Line Height */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Line Spacing</span>
              <span className="font-bold">{settings.lineSpacing.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.4"
              max="2.6"
              step="0.1"
              value={settings.lineSpacing}
              onChange={(e) => updateSetting('lineSpacing', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Letter Spacing */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Letter Spacing (Tracking)</span>
              <span className="font-bold">+{Math.round(settings.letterSpacing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.20"
              step="0.01"
              value={settings.letterSpacing}
              onChange={(e) => updateSetting('letterSpacing', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Word Spacing */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Word Spacing</span>
              <span className="font-bold">+{Math.round(settings.wordSpacing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.35"
              step="0.02"
              value={settings.wordSpacing}
              onChange={(e) => updateSetting('wordSpacing', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Visual Aids (Reading Ruler, Bionic Reading, Syllable Dots) */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5 mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Visual Focus Aids</span>
          </label>

          {/* Reading Ruler Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-sm font-semibold">Reading Focus Ruler</div>
              <div className="text-xs opacity-70">Follows cursor to prevent line jumping</div>
            </div>
            <input
              type="checkbox"
              checked={settings.readingRuler}
              onChange={(e) => updateSetting('readingRuler', e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
            />
          </div>

          {/* Bionic Reading Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-sm font-semibold">Bionic Reading Fixation</div>
              <div className="text-xs opacity-70">Bolds initial letters to guide eye saccades</div>
            </div>
            <input
              type="checkbox"
              checked={settings.bionicMode}
              onChange={(e) => updateSetting('bionicMode', e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
            />
          </div>

          {/* Syllable Dots Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="text-sm font-semibold">Syllable Division View</div>
              <div className="text-xs opacity-70">Separates syllables with subtle dots</div>
            </div>
            <input
              type="checkbox"
              checked={settings.syllableDots}
              onChange={(e) => updateSetting('syllableDots', e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
            />
          </div>
        </div>

        {/* 7. Simplification Level Switcher */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Simplification Level</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {levels.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  updateSetting('simplificationLevel', l.id);
                  if (activeDocument && onReSimplify) {
                    onReSimplify(l.id);
                  }
                }}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                  settings.simplificationLevel === l.id
                    ? 'font-bold ring-2 ring-emerald-500 shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: settings.simplificationLevel === l.id ? 'var(--accent-color)' : 'var(--bg-main)',
                  color: settings.simplificationLevel === l.id ? 'var(--accent-text)' : 'var(--text-main)',
                  borderColor: 'var(--border-color)'
                }}>
                <div className="text-xs font-bold capitalize">{l.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 8. Full Paragraph Narration Speed */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
            <span className="flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Paragraph Narration Speed</span>
            </span>
            <span className="font-bold">{settings.speechRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.3"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => updateSetting('speechRate', Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

      </div>
    </div>
  );
}
