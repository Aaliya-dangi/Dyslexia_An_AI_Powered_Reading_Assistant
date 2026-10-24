import React, { createContext, useContext, useState, useEffect } from 'react';

const ReadingSettingsContext = createContext(null);

export const THEME_PRESETS = [
  { id: 'cream', name: 'Warm Cream', desc: 'Reduces visual glare & stress (Meares-Irlen)', bg: '#FAF7EE', card: '#F3ECE0', text: '#24211D', border: '#DDD4BF' },
  { id: 'mint', name: 'Soft Sage Mint', desc: 'Calming green contrast to reduce eye fatigue', bg: '#EDF6F1', card: '#DDEEE5', text: '#0F241A', border: '#B9DACB' },
  { id: 'lavender', name: 'Lavender Mist', desc: 'Gentle pastel tint for chromatic relief', bg: '#F5F3FA', card: '#EAE5F5', text: '#1D142B', border: '#D2C5EA' },
  { id: 'peach', name: 'Peach Sunset', desc: 'Warm soft tint with zero blue glare', bg: '#FDF4EE', card: '#F8E5DA', text: '#2B150A', border: '#EAC8B3' },
  { id: 'paper', name: 'Classic Paper', desc: 'Soft warm neutral book page', bg: '#FBF9F4', card: '#F2ECE0', text: '#1A202C', border: '#D8D0BE' },
  { id: 'slate', name: 'Midnight Slate', desc: 'Dark low-light mode for photophobia', bg: '#131920', card: '#1C2530', text: '#F1F5F9', border: '#2D3D4E' },
  { id: 'high-contrast-dark', name: 'High Contrast (Yellow / Black)', desc: 'Maximum visibility & clear distinction', bg: '#000000', card: '#121212', text: '#FFFF00', border: '#FFFF00' },
  { id: 'high-contrast-light', name: 'High Contrast (Black / White)', desc: '100% ink contrast with crisp borders', bg: '#FFFFFF', card: '#F4F4F4', text: '#000000', border: '#000000' },
];

export const CONTRAST_MODES = [
  { id: 'soft', name: 'Soft (Low Glare)', desc: 'Gentle contrast for sensitive eyes' },
  { id: 'balanced', name: 'Standard (Balanced)', desc: 'Natural optimal contrast' },
  { id: 'high', name: 'High (Sharp)', desc: 'Bold borders and maximum definition' },
];

export const WORD_SPEED_PRESETS = [
  { id: 'ultra-slow', value: 0.45, label: '0.45x Ultra-Slow', desc: 'Syllable-paced deliberate enunciation' },
  { id: 'slow', value: 0.60, label: '0.60x Slow & Clear', desc: 'Standard dyslexia phonological speed (Recommended)' },
  { id: 'moderate', value: 0.80, label: '0.80x Moderate', desc: 'Comfortable natural pace' }
];

const DEFAULT_SETTINGS = {
  font: 'OpenDyslexic',
  fontSize: 20,
  lineSpacing: 1.9,
  letterSpacing: 0.08,
  wordSpacing: 0.16,
  theme: 'cream',
  contrastMode: 'balanced',
  readingRuler: false,
  rulerHeight: 56,
  bionicMode: false,
  syllableDots: false,
  simplificationLevel: 'moderate',
  speechRate: 0.9,
  wordAudioSpeed: 0.60, // Slow clear speed for word-level pronunciation assistance
  speechPitch: 1.0,
  ttsHighlight: true
};

export function ReadingSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dyslexia_reader_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply theme & contrast to html AND body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const theme = settings.theme || 'cream';
    const contrast = settings.contrastMode || 'balanced';
    const isDark = theme === 'slate' || theme === 'high-contrast-dark';

    // Set dataset attributes
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-contrast', contrast);
    body.setAttribute('data-theme', theme);
    body.setAttribute('data-contrast', contrast);

    // Set class lists
    root.className = `theme-${theme} contrast-${contrast} ${isDark ? 'dark' : ''}`;
    body.className = `theme-${theme} contrast-${contrast} ${isDark ? 'dark' : ''}`;

    // Store in localStorage
    try {
      localStorage.setItem('dyslexia_reader_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <ReadingSettingsContext.Provider value={{
      settings,
      updateSetting,
      resetDefaults,
      THEME_PRESETS,
      CONTRAST_MODES,
      WORD_SPEED_PRESETS
    }}>
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettings() {
  const ctx = useContext(ReadingSettingsContext);
  if (!ctx) {
    throw new Error('useReadingSettings must be used within ReadingSettingsProvider');
  }
  return ctx;
}
