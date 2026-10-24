import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Mic,
  Check,
  X,
  ArrowRight,
  Layers,
  Repeat,
  Gauge
} from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';

export default function WordModal({
  wordData,
  onClose,
  onReplaceWord,
  onOpenPronounce
}) {
  const { settings, updateSetting } = useReadingSettings();
  
  // Audio state
  const [isPlayingFullWord, setIsPlayingFullWord] = useState(false);
  const [isPlayingSyllables, setIsPlayingSyllables] = useState(false);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(settings.wordAudioSpeed || 0.60);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);

  const isCancelledRef = useRef(false);

  if (!wordData) return null;

  const {
    word = '',
    originalWord = '',
    simplifiedWord = '',
    syllables = [],
    definition = 'A complex or academic term.',
    synonyms = []
  } = wordData;

  const displayWord = originalWord || word;
  const syllableList = syllables && syllables.length > 0 ? syllables : [displayWord];

  // Stop any ongoing speech when modal unmounts
  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop all audio helper
  const handleStopAudio = () => {
    isCancelledRef.current = true;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingFullWord(false);
    setIsPlayingSyllables(false);
    setActiveSyllableIndex(-1);
  };

  /**
   * 1. Speak Full Word at Selected Slow Speed
   */
  const handlePronounceSlow = (targetSpeed = playbackSpeed, loopRemaining = repeatCount) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    handleStopAudio();
    isCancelledRef.current = false;

    const speakIteration = (remaining) => {
      if (remaining <= 0 || isCancelledRef.current) {
        setIsPlayingFullWord(false);
        return;
      }

      setIsPlayingFullWord(true);
      const utterance = new SpeechSynthesisUtterance(displayWord);
      utterance.rate = targetSpeed; // e.g. 0.45x, 0.60x, 0.85x
      utterance.pitch = settings.speechPitch || 1.0;

      utterance.onend = () => {
        if (!isCancelledRef.current && remaining > 1) {
          setTimeout(() => {
            speakIteration(remaining - 1);
          }, 400);
        } else {
          setIsPlayingFullWord(false);
        }
      };

      utterance.onerror = () => {
        setIsPlayingFullWord(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakIteration(loopRemaining);
  };

  /**
   * 2. Speak Syllable-by-Syllable Sequentially with Visual Highlighting
   */
  const handlePronounceSyllables = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    handleStopAudio();
    isCancelledRef.current = false;
    setIsPlayingSyllables(true);

    const playSyllableAt = (index) => {
      if (isCancelledRef.current || index >= syllableList.length) {
        setIsPlayingSyllables(false);
        setActiveSyllableIndex(-1);
        return;
      }

      setActiveSyllableIndex(index);
      const sylText = syllableList[index];
      const utterance = new SpeechSynthesisUtterance(sylText);
      utterance.rate = Math.min(0.65, playbackSpeed); // Deliberate speed for syllable
      utterance.pitch = settings.speechPitch || 1.0;

      utterance.onend = () => {
        if (!isCancelledRef.current) {
          // Pause between syllables to give dyslexic learner processing time
          setTimeout(() => {
            playSyllableAt(index + 1);
          }, 350);
        }
      };

      utterance.onerror = () => {
        setIsPlayingSyllables(false);
        setActiveSyllableIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    playSyllableAt(0);
  };

  /**
   * 3. Speak Single Syllable on Click
   */
  const handlePlaySingleSyllable = (sylText, index) => {
    if (!('speechSynthesis' in window)) return;
    handleStopAudio();
    isCancelledRef.current = false;
    setActiveSyllableIndex(index);

    const utterance = new SpeechSynthesisUtterance(sylText);
    utterance.rate = 0.55;
    utterance.onend = () => setActiveSyllableIndex(-1);
    utterance.onerror = () => setActiveSyllableIndex(-1);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all transform scale-100"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)'
        }}>
        
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                 style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black capitalize tracking-wide">{displayWord}</h3>
              <p className="text-xs opacity-75">Dyslexia Slow Pronunciation Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="p-2 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Section A: Dedicated Slow Voice Pronunciation Controller */}
          <div className="p-4 rounded-xl border space-y-3"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                <span>Voice Pronunciation Speed</span>
              </label>
              
              {/* Loop / Repeat selector */}
              <div className="flex items-center space-x-1">
                <span className="text-[11px] font-bold opacity-75 mr-1 flex items-center space-x-0.5">
                  <Repeat className="w-3 h-3" />
                  <span>Repeat:</span>
                </span>
                {[1, 2, 3].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setRepeatCount(cnt)}
                    className={`px-2 py-0.5 rounded text-xs font-bold border transition-all ${
                      repeatCount === cnt ? 'ring-2 ring-emerald-500 font-black shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: repeatCount === cnt ? 'var(--accent-color)' : 'var(--card-bg)',
                      color: repeatCount === cnt ? 'var(--accent-text)' : 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}>
                    {cnt}x
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { speed: 0.45, label: '0.45x Ultra-Slow', desc: 'Syllable spaced' },
                { speed: 0.60, label: '0.60x Slow & Clear', desc: 'Phonological (Best)' },
                { speed: 0.85, label: '0.85x Normal', desc: 'Standard speed' }
              ].map(opt => {
                const isSelected = playbackSpeed === opt.speed;
                return (
                  <button
                    key={opt.speed}
                    onClick={() => {
                      setPlaybackSpeed(opt.speed);
                      updateSetting('wordAudioSpeed', opt.speed);
                      handlePronounceSlow(opt.speed);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected ? 'ring-2 ring-emerald-500 font-bold shadow-xs' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--card-bg)',
                      color: isSelected ? 'var(--accent-text)' : 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}>
                    <div className="text-xs font-black">{opt.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Primary Action Buttons: Slow Pronounce vs Syllable Sequencer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              
              <button
                onClick={() => handlePronounceSlow()}
                disabled={isPlayingFullWord || isPlayingSyllables}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all ${
                  isPlayingFullWord
                    ? 'ring-4 ring-amber-400 scale-[0.99]'
                    : 'hover:scale-[1.01] active:scale-[0.98]'
                }`}
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--accent-text)'
                }}>
                <Volume2 className={`w-4 h-4 ${isPlayingFullWord ? 'animate-bounce' : ''}`} />
                <span>{isPlayingFullWord ? `Speaking (${repeatCount}x)...` : 'Slow Pronounce'}</span>
              </button>

              <button
                onClick={handlePronounceSyllables}
                disabled={isPlayingFullWord || isPlayingSyllables}
                className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center space-x-2 shadow-xs transition-all ${
                  isPlayingSyllables
                    ? 'ring-4 ring-indigo-400 scale-[0.99]'
                    : 'hover:scale-[1.01] active:scale-[0.98]'
                }`}
                style={{
                  backgroundColor: isPlayingSyllables ? '#6366F1' : 'var(--card-bg)',
                  color: isPlayingSyllables ? '#FFFFFF' : 'var(--text-main)',
                  borderColor: 'var(--border-color)'
                }}>
                <Layers className="w-4 h-4" />
                <span>{isPlayingSyllables ? 'Syllable Step Audio...' : 'Hear Syllables'}</span>
              </button>

            </div>

            {(isPlayingFullWord || isPlayingSyllables) && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleStopAudio}
                  className="text-xs text-red-600 hover:underline font-bold flex items-center space-x-1">
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Speech</span>
                </button>
              </div>
            )}

          </div>

          {/* Section B: Syllable Interactive Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-75 block">
                Syllable Breakdown (Tap any syllable to hear)
              </label>
              <span className="text-[11px] opacity-60 font-semibold">{syllableList.length} syllables</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl border"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              {syllableList.map((syl, i) => {
                const isActive = activeSyllableIndex === i;
                return (
                  <React.Fragment key={i}>
                    <button
                      type="button"
                      onClick={() => handlePlaySingleSyllable(syl, i)}
                      title={`Tap to pronounce "${syl}" slowly`}
                      className={`px-3 py-1.5 rounded-xl font-black text-base sm:text-lg border shadow-xs transition-all ${
                        isActive
                          ? 'scale-115 ring-4 ring-amber-400 bg-amber-300 text-amber-900 border-amber-500'
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#FDE047' : 'var(--flag-bg)',
                        color: isActive ? '#78350F' : 'var(--flag-text)',
                        borderColor: isActive ? '#D97706' : 'var(--flag-border)'
                      }}>
                      {syl}
                    </button>
                    {i < syllableList.length - 1 && (
                      <span className="font-black opacity-40 text-xl">·</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Section C: Plain Meaning */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5 block">
              Simple Definition
            </label>
            <div className="p-3.5 rounded-xl border text-sm sm:text-base leading-relaxed"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <p className="font-medium">{definition}</p>
            </div>
          </div>

          {/* Section D: Simple Synonyms / Substitution */}
          {simplifiedWord && simplifiedWord.toLowerCase() !== displayWord.toLowerCase() && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5 block">
                Simpler Replacement
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl border"
                   style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-0.5 rounded font-bold border"
                        style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
                    Plain Word
                  </span>
                  <span className="font-bold text-base capitalize">{simplifiedWord}</span>
                </div>
                {onReplaceWord && (
                  <button
                    onClick={() => {
                      handleStopAudio();
                      onReplaceWord(displayWord, simplifiedWord);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
                    <span>Use Simpler</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section E: Pronunciation Practice Trigger */}
          {onOpenPronounce && (
            <button
              onClick={() => {
                handleStopAudio();
                onClose();
                onOpenPronounce(displayWord);
              }}
              className="w-full py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 shadow-xs hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}>
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Practice Speaking This Word With AI Feedback</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
