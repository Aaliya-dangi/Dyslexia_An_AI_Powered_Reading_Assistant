import React from 'react';
import { TrendingDown, Clock, BookOpen, CheckCircle, BarChart3 } from 'lucide-react';

export default function StatsCard({ readabilityScore, paragraphs = [], simplificationLevel = 'moderate' }) {
  if (!readabilityScore) return null;

  const {
    fleschReadingEase = 70,
    fleschKincaidGrade = 6,
    originalGrade = 12,
    originalReadingEase = 35,
    estimatedReadingTimeMinutes = 1,
    gradeDrop = 4
  } = readabilityScore;

  const totalWords = paragraphs.reduce((acc, p) => acc + (p.stats?.simplifiedWordCount || 0), 0);
  const totalSentences = paragraphs.reduce((acc, p) => acc + (p.stats?.simplifiedSentenceCount || 0), 0);

  // Friendly grade label
  const getGradeLabel = (g) => {
    if (g <= 5) return 'Elementary (Easy)';
    if (g <= 8) return 'Middle School (Accessible)';
    if (g <= 12) return 'High School (Moderate)';
    return 'College / Academic (Dense)';
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border shadow-sm transition-all mb-6"
         style={{
           backgroundColor: 'var(--card-bg)',
           borderColor: 'var(--border-color)',
           color: 'var(--text-main)'
         }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-4"
           style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm sm:text-base">AI Simplification & Readability Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--flag-bg)',
                  color: 'var(--flag-text)',
                  border: '1px solid var(--flag-border)'
                }}>
            Level: {simplificationLevel}
          </span>
          {gradeDrop > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Reduced by {gradeDrop.toFixed(1)} grades</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Reading Grade Level */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs opacity-75 font-medium mb-1">Target Reading Grade</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-emerald-600">{fleschKincaidGrade}</span>
            <span className="text-xs line-through opacity-50 font-semibold">Gr. {originalGrade}</span>
          </div>
          <div className="text-[11px] font-semibold mt-1 opacity-80">{getGradeLabel(fleschKincaidGrade)}</div>
        </div>

        {/* Metric 2: Flesch Reading Ease */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs opacity-75 font-medium mb-1">Reading Ease Score</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-blue-600">{fleschReadingEase}</span>
            <span className="text-xs opacity-60 font-semibold">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold mt-1 opacity-80">
            {fleschReadingEase >= 70 ? 'Very Easy to Read' : fleschReadingEase >= 50 ? 'Comfortable Pace' : 'Moderate Challenge'}
          </div>
        </div>

        {/* Metric 3: Estimated Reading Time */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs opacity-75 font-medium mb-1">Est. Reading Time</div>
          <div className="flex items-baseline space-x-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-2xl font-black">{estimatedReadingTimeMinutes}</span>
            <span className="text-xs opacity-75">min</span>
          </div>
          <div className="text-[11px] font-semibold mt-1 opacity-80">At adaptive 130 WPM</div>
        </div>

        {/* Metric 4: Sentence & Word Density */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <div className="text-xs opacity-75 font-medium mb-1">Content Structure</div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black">{totalWords || readabilityScore.totalWords || '—'}</span>
            <span className="text-xs opacity-75">words</span>
          </div>
          <div className="text-[11px] font-semibold mt-1 opacity-80">
            Split into {totalSentences || paragraphs.length} concise units
          </div>
        </div>

      </div>
    </div>
  );
}
