import React from 'react';
import { ArrowRight, BookOpen, Check, X } from 'lucide-react';

export default function WordModal({ wordData, onClose, onReplaceWord }) {
  if (!wordData) return null;

  const displayWord = wordData.originalWord || wordData.word || '';
  const syllables = wordData.syllables?.length ? wordData.syllables : [displayWord];
  const simpler = wordData.simplifiedWord || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Word details for ${displayWord}`}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}><BookOpen className="w-5 h-5" /></div>
            <div><h3 className="text-2xl font-black capitalize">{displayWord}</h3><p className="text-xs opacity-70">Word support</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg border" style={{ borderColor: 'var(--border-color)' }} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-xs font-black uppercase tracking-wider opacity-70">Syllables</label>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              {syllables.map((syl, i) => <React.Fragment key={`${syl}-${i}`}><span className="px-3 py-1.5 rounded-lg font-black text-lg" style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', border: '1px solid var(--flag-border)' }}>{syl}</span>{i < syllables.length - 1 && <span className="font-black opacity-40">·</span>}</React.Fragment>)}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider opacity-70">Simple definition</label>
            <div className="mt-2 p-4 rounded-xl border text-sm sm:text-base leading-relaxed" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>{wordData.definition || 'No definition was supplied by the processing pipeline.'}</div>
          </div>

          {wordData.synonyms?.length > 0 && (
            <div>
              <label className="text-xs font-black uppercase tracking-wider opacity-70">Plain-language alternatives</label>
              <div className="mt-2 flex flex-wrap gap-2">{wordData.synonyms.map((s, i) => <span key={`${s}-${i}`} className="px-2.5 py-1 rounded-lg border text-sm font-semibold" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>{s}</span>)}</div>
            </div>
          )}

          {simpler && simpler.toLowerCase() !== displayWord.toLowerCase() && (
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <label className="text-xs font-black uppercase tracking-wider opacity-70">Simpler replacement</label>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-black text-lg">{simpler}</span>
                {onReplaceWord && <button onClick={() => { onReplaceWord(displayWord, simpler); onClose(); }} className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>Use simpler <ArrowRight className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl border text-xs leading-relaxed opacity-80" style={{ borderColor: 'var(--border-color)' }}>
            <Check className="inline w-3.5 h-3.5 mr-1" style={{ color: 'var(--accent-color)' }} />
            Audio pronunciation and speech practice are intentionally disabled in this stage.
          </div>
        </div>
      </div>
    </div>
  );
}
