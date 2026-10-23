import React from 'react';
import { Check, Contrast, Eye, Maximize2, Palette, RotateCcw, Sliders, Sparkles, Type, X } from 'lucide-react';
import { useReadingSettings, THEME_PRESETS, CONTRAST_MODES } from '../context/ReadingSettingsContext';

const FONT_OPTIONS = [
  { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Dyslexia-oriented weighted letterforms' },
  { id: 'Lexend', name: 'Lexend', desc: 'Designed for comfortable continuous reading' },
  { id: 'Atkinson', name: 'Atkinson Hyperlegible', desc: 'Strong character distinction' },
  { id: 'Comic Neue', name: 'Comic Neue', desc: 'Friendly rounded letterforms' },
  { id: 'Inter', name: 'Inter', desc: 'Clean standard sans-serif' }
];

const LEVELS = [
  { id: 'light', name: 'Light', desc: 'Gentle vocabulary changes' },
  { id: 'moderate', name: 'Moderate', desc: 'Balanced vocabulary and sentence simplification' },
  { id: 'high', name: 'High', desc: 'Shorter sentences and simpler vocabulary' }
];

export default function SettingsBar({ isOpen, onClose, activeDocument, onReSimplify }) {
  const { settings, updateSetting, resetDefaults } = useReadingSettings();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl border-l flex flex-col backdrop-blur-md overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
        <div className="flex items-center gap-2"><Sliders className="w-5 h-5" style={{ color: 'var(--accent-color)' }} /><h2 className="font-extrabold text-lg">Reading Preferences</h2></div>
        <div className="flex items-center gap-2">
          <button onClick={resetDefaults} title="Reset settings" className="p-1.5 rounded-lg border text-xs flex items-center gap-1 font-bold" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}><RotateCcw className="w-3.5 h-3.5" /><span>Reset</span></button>
          <button onClick={onClose} className="p-1.5 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }} aria-label="Close settings"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5 mb-2"><Palette className="w-3.5 h-3.5" />Background Tint & Color</label>
          <div className="grid gap-2">
            {THEME_PRESETS.map(t => {
              const selected = settings.theme === t.id;
              return <button key={t.id} onClick={() => updateSetting('theme', t.id)} className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${selected ? 'ring-2 ring-emerald-500 font-bold' : 'opacity-85 hover:opacity-100'}`} style={{ backgroundColor: t.bg, color: t.text, borderColor: selected ? 'var(--accent-color)' : t.border }}><div className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border" style={{ backgroundColor: t.card, borderColor: t.border }} /><div><div className="text-sm font-extrabold">{t.name}</div><div className="text-xs opacity-75">{t.desc}</div></div></div>{selected && <Check className="w-4 h-4" />}</button>;
            })}
          </div>
        </section>

        <section className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5 mb-2"><Contrast className="w-3.5 h-3.5" />Contrast Intensity</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CONTRAST_MODES.map(c => {
              const selected = settings.contrastMode === c.id;
              return <button key={c.id} onClick={() => updateSetting('contrastMode', c.id)} className={`py-2 px-1.5 rounded-xl border text-center ${selected ? 'font-bold ring-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'}`} style={{ backgroundColor: selected ? 'var(--accent-color)' : 'var(--bg-main)', color: selected ? 'var(--accent-text)' : 'var(--text-main)', borderColor: 'var(--border-color)' }}><div className="text-xs font-bold">{c.name.split(' ')[0]}</div><div className="text-[10px] opacity-75">{c.name.split(' ')[1] || ''}</div></button>;
            })}
          </div>
        </section>

        <section className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5 mb-2"><Type className="w-3.5 h-3.5" />Reading Font</label>
          <div className="grid gap-1.5">
            {FONT_OPTIONS.map(f => {
              const selected = settings.font === f.id;
              return <button key={f.id} onClick={() => updateSetting('font', f.id)} className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border flex items-center justify-between ${selected ? 'font-extrabold ring-2 ring-emerald-500' : 'opacity-80 hover:opacity-100'}`} style={{ backgroundColor: selected ? 'var(--bg-main)' : 'transparent', borderColor: 'var(--border-color)', fontFamily: f.id === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : f.id === 'Lexend' ? '"Lexend", sans-serif' : f.id === 'Atkinson' ? '"Atkinson Hyperlegible", sans-serif' : f.id === 'Comic Neue' ? '"Comic Neue", cursive' : '"Inter", sans-serif' }}><div><div>{f.name}</div><div className="text-[11px] opacity-60 font-sans">{f.desc}</div></div>{selected && <Check className="w-4 h-4" />}</button>;
            })}
          </div>
        </section>

        <section className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" />Text Size & Spacing</label>
          <Range label="Font Size" value={settings.fontSize} min={14} max={34} step={1} suffix="px" onChange={v => updateSetting('fontSize', v)} />
          <Range label="Line Spacing" value={settings.lineSpacing} min={1.4} max={2.6} step={0.1} suffix="x" onChange={v => updateSetting('lineSpacing', v)} />
          <Range label="Letter Spacing" value={settings.letterSpacing} min={0} max={0.2} step={0.01} suffix="em" onChange={v => updateSetting('letterSpacing', v)} />
          <Range label="Word Spacing" value={settings.wordSpacing} min={0.05} max={0.35} step={0.02} suffix="em" onChange={v => updateSetting('wordSpacing', v)} />
        </section>

        <section className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Visual Focus Aids</label>
          <Toggle label="Reading Focus Ruler" description="Keeps a movable focus band over the current line" checked={settings.readingRuler} onChange={v => updateSetting('readingRuler', v)} />
          <Toggle label="Bionic Reading Fixation" description="Emphasizes the beginning of words to guide visual fixation" checked={settings.bionicMode} onChange={v => updateSetting('bionicMode', v)} />
          <Toggle label="Syllable Division View" description="Shows syllable boundaries for flagged vocabulary" checked={settings.syllableDots} onChange={v => updateSetting('syllableDots', v)} />
        </section>

        <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />AI Simplification Level</label>
          <div className="grid grid-cols-3 gap-1.5">
            {LEVELS.map(level => {
              const selected = settings.simplificationLevel === level.id;
              return <button key={level.id} onClick={() => { updateSetting('simplificationLevel', level.id); if (activeDocument && onReSimplify) onReSimplify(level.id); }} className={`py-2.5 px-1 rounded-xl border text-center ${selected ? 'font-bold ring-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'}`} style={{ backgroundColor: selected ? 'var(--accent-color)' : 'var(--bg-main)', color: selected ? 'var(--accent-text)' : 'var(--text-main)', borderColor: 'var(--border-color)' }}><div className="text-xs font-bold capitalize">{level.name}</div><div className="text-[10px] opacity-80 mt-1 leading-tight">{level.desc}</div></button>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Range({ label, value, min, max, step, suffix, onChange }) {
  return <div><div className="flex justify-between text-xs mb-1"><span className="font-medium">{label}</span><span className="font-bold">{Number(value).toFixed(step < 1 ? 2 : 0)}{suffix}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer" /></div>;
}

function Toggle({ label, description, checked, onChange }) {
  return <div className="flex items-center justify-between gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}><div><div className="text-sm font-semibold">{label}</div><div className="text-xs opacity-70 mt-0.5">{description}</div></div><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5 accent-emerald-600 cursor-pointer" /></div>;
}
