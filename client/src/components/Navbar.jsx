import React from 'react';
import { BookOpen, Sliders, FileText, Upload, Sparkles, SunMoon } from 'lucide-react';
import { useReadingSettings, THEME_PRESETS } from '../context/ReadingSettingsContext';

export default function Navbar({
  currentView,
  onNavigate,
  activeDocument,
  isSettingsOpen,
  onToggleSettings
}) {
  const { settings, updateSetting } = useReadingSettings();

  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onNavigate('input')}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
               style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wide">LexiRead</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', border: '1.5px solid var(--flag-border)' }}>
                AI Assistant
              </span>
            </div>
            <p className="text-[11px] hidden sm:block opacity-75">Dyslexia-Friendly Adaptive Reader</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-xl border"
             style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => onNavigate('input')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'input'
                ? 'shadow-sm font-bold'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: currentView === 'input' ? 'var(--card-bg)' : 'transparent',
              color: 'var(--text-main)',
              border: currentView === 'input' ? '1px solid var(--border-color)' : 'none'
            }}>
            <FileText className="w-4 h-4" />
            <span>Type / Paste</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'upload'
                ? 'shadow-sm font-bold'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: currentView === 'upload' ? 'var(--card-bg)' : 'transparent',
              color: 'var(--text-main)',
              border: currentView === 'upload' ? '1px solid var(--border-color)' : 'none'
            }}>
            <Upload className="w-4 h-4" />
            <span>OCR File / PDF</span>
          </button>

          {activeDocument && (
            <button
              onClick={() => onNavigate('reading')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'reading'
                  ? 'shadow-sm font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: currentView === 'reading' ? 'var(--accent-color)' : 'transparent',
                color: currentView === 'reading' ? 'var(--accent-text)' : 'var(--text-main)'
              }}>
              <Sparkles className="w-4 h-4" />
              <span>Reading View</span>
            </button>
          )}
        </div>

        {/* Right Tools: Theme Quick Swatches & Settings Drawer Toggle */}
        <div className="flex items-center space-x-2">
          {/* Quick Theme Swatch Palette */}
          <div className="hidden lg:flex items-center space-x-1 p-1 rounded-xl border shadow-inner"
               style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            {THEME_PRESETS.slice(0, 6).map(t => (
              <button
                key={t.id}
                onClick={() => updateSetting('theme', t.id)}
                title={`${t.name}: ${t.desc}`}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  settings.theme === t.id ? 'scale-125 ring-2 ring-emerald-500 shadow-sm z-10' : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.bg, borderColor: t.border }}
              />
            ))}
          </div>

          {/* Reading Preferences Toggle Button */}
          <button
            onClick={onToggleSettings}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold border shadow-sm transition-all ${
              isSettingsOpen ? 'ring-2 ring-emerald-500' : 'hover:opacity-90'
            }`}
            style={{
              backgroundColor: isSettingsOpen ? 'var(--accent-color)' : 'var(--bg-main)',
              color: isSettingsOpen ? 'var(--accent-text)' : 'var(--text-main)',
              borderColor: 'var(--border-color)'
            }}
            aria-label="Toggle Dyslexia Reading Settings">
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Dyslexia Tools</span>
          </button>
        </div>
      </div>
    </header>
  );
}
