import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  Play,
  Pause,
  Layers,
  Sparkles,
  HelpCircle,
  Radio,
  Check,
  Ear,
  Upload,
  ShieldAlert,
  Settings,
  RefreshCw,
  FileAudio
} from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';

/**
 * Helper: Compute Levenshtein edit distance between two normalized strings
 */
function getLevenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = [];
  for (let j = 0; j <= a.length; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      let val;
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }

  return row[a.length];
}

/**
 * Calculate Word & Phrase Level Pronunciation Accuracy
 * Normalizes speech, checks for exact matches, compound spacing,
 * token alignment, and character-level edit distance.
 */
function calculatePronunciationScore(spoken, target) {
  // Normalize strings: lowercase, remove non-alphanumeric (except spaces), trim
  const cleanSpoken = (spoken || '').toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');
  const cleanTarget = (target || '').toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');

  if (!cleanSpoken || !cleanTarget) {
    return {
      score: 0,
      feedback: 'No speech was detected. Please tap the microphone and speak the word aloud.'
    };
  }

  // 1. Exact match
  if (cleanSpoken === cleanTarget) {
    return {
      score: 100,
      feedback: 'Excellent! 100% accurate pronunciation clarity!'
    };
  }

  // 2. Exact match ignoring internal spaces (e.g. "photo synthesis" vs "photosynthesis")
  const collapsedSpoken = cleanSpoken.replace(/\s+/g, '');
  const collapsedTarget = cleanTarget.replace(/\s+/g, '');
  if (collapsedSpoken === collapsedTarget) {
    return {
      score: 100,
      feedback: 'Excellent! 100% accurate pronunciation clarity!'
    };
  }

  // 3. Spoken sentence: check if exact target word is inside spoken words
  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);

  if (targetWords.length === 1 && spokenWords.length > 1) {
    if (spokenWords.includes(cleanTarget)) {
      return {
        score: 95,
        feedback: `Great! Target word "${cleanTarget}" clearly identified in your speech.`
      };
    }
  }

  // 4. Calculate best alignment similarity
  let bestSim = 0;

  if (targetWords.length === 1) {
    // Check similarity with full collapsed string
    const distCollapsed = getLevenshteinDistance(collapsedSpoken, collapsedTarget);
    const maxLenCollapsed = Math.max(collapsedSpoken.length, collapsedTarget.length);
    const simCollapsed = maxLenCollapsed > 0 ? Math.max(0, 1 - distCollapsed / maxLenCollapsed) : 0;
    bestSim = simCollapsed;

    // Check against individual spoken words (to pick up the closest pronounced attempt)
    for (const word of spokenWords) {
      const distWord = getLevenshteinDistance(word, cleanTarget);
      const maxLenWord = Math.max(word.length, cleanTarget.length);
      const simWord = maxLenWord > 0 ? Math.max(0, 1 - distWord / maxLenWord) : 0;
      if (simWord > bestSim) {
        bestSim = simWord;
      }
    }
  } else {
    // Multi-word target phrase: compute word-level match + phrase edit distance
    const distPhrase = getLevenshteinDistance(cleanSpoken, cleanTarget);
    const maxLenPhrase = Math.max(cleanSpoken.length, cleanTarget.length);
    const charSim = maxLenPhrase > 0 ? Math.max(0, 1 - distPhrase / maxLenPhrase) : 0;

    let matchedWords = 0;
    targetWords.forEach(tw => {
      if (spokenWords.some(sw => sw === tw || getLevenshteinDistance(sw, tw) <= 1)) {
        matchedWords++;
      }
    });
    const wordSim = targetWords.length > 0 ? matchedWords / targetWords.length : 0;
    bestSim = (charSim * 0.4) + (wordSim * 0.6);
  }

  // Scale to percentage (0 - 100)
  const finalPercentage = Math.min(100, Math.max(0, Math.round(bestSim * 100)));

  // Generate encouraging, accurate dyslexia-friendly feedback
  let feedbackText = '';
  if (finalPercentage >= 90) {
    feedbackText = 'Great pronunciation! Very clear articulation.';
  } else if (finalPercentage >= 75) {
    feedbackText = 'Good pronunciation! Minor sound variation detected.';
  } else if (finalPercentage >= 50) {
    feedbackText = 'Good effort! Listen to the slow model below to refine your pronunciation.';
  } else if (finalPercentage >= 25) {
    feedbackText = `Partial match recognized ("${cleanSpoken}"). Listen to the syllables and try again.`;
  } else {
    feedbackText = `Heard "${cleanSpoken}". Listen to the slow model below and try speaking the target word again.`;
  }

  return {
    score: finalPercentage,
    feedback: feedbackText
  };
}

export default function PronunciationModal({ targetText, onClose }) {
  const { settings } = useReadingSettings();
  
  // State
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [modelSpeed, setModelSpeed] = useState(settings.wordAudioSpeed || 0.60);
  const [matchScore, setMatchScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [activeTab, setActiveTab] = useState('mic'); // 'mic' | 'upload' | 'manual'
  const [manualTypedText, setManualTypedText] = useState('');

  // Audio Context & Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const userAudioPlayerRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const spokenTextRef = useRef('');

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch {}
    }
    if (userAudioPlayerRef.current) {
      try { userAudioPlayerRef.current.pause(); } catch {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  /**
   * 1. Initialize Laptop Microphone with Diagnostics
   */
  const requestMicrophoneAccess = async () => {
    setMicErrorMessage(null);
    setShowPermissionGuide(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support Web Audio capture. Please use Chrome or Edge.');
      }

      // Trigger native browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      setMicPermissionGranted(true);
      setMicErrorMessage(null);

      // Setup AudioContext for Live Volume Visualizer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolumeLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      return stream;
    } catch (err) {
      console.warn('Microphone access notice:', err);
      setMicPermissionGranted(false);
      setShowPermissionGuide(true);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicErrorMessage('Browser or Windows blocked microphone permission.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicErrorMessage('No active microphone found on your laptop.');
      } else {
        setMicErrorMessage(err.message || 'Microphone access is restricted on this browser.');
      }
      return null;
    }
  };

  /**
   * 2. Start Dual Recording (MediaRecorder + Web Speech Recognizer)
   */
  const handleStartRecording = async () => {
    let stream = streamRef.current;
    if (!stream || !micPermissionGranted) {
      stream = await requestMicrophoneAccess();
      if (!stream) return;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setSpokenText('');
    setMatchScore(null);
    setRecordedAudioUrl(null);
    setFeedback('Listening... Speak the word into your laptop mic now!');
    setIsRecording(true);

    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start(100);
    } catch (e) {
      console.warn('MediaRecorder notice:', e);
    }

    // Setup Web Speech Recognizer
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
        }

        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        spokenTextRef.current = '';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const transcript = (finalTranscript || interimTranscript).trim();
          if (transcript) {
            setSpokenText(transcript);
            spokenTextRef.current = transcript;
            if (event.results[event.results.length - 1]?.isFinal) {
              evaluateMatch(transcript, targetText);
            }
          }
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition notice:', e.error);
        };

        recognition.onend = () => {
          recognitionRef.current = null;
        };

        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start notice:', err);
      }
    }
  };

  /**
   * 3. Stop Recording
   */
  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const textToEvaluate = (spokenTextRef.current || spokenText || '').trim();
    if (textToEvaluate) {
      evaluateMatch(textToEvaluate, targetText);
    } else {
      setMatchScore(null);
      setFeedback('Audio recorded! Click "Play Patient Voice" to listen, or tap the microphone to try speaking again.');
    }
  };

  /**
   * 4. Play User's Own Voice Recording
   */
  const handlePlayUserVoice = () => {
    if (!recordedAudioUrl) return;
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    userAudioPlayerRef.current = audio;
    setIsPlayingUserAudio(true);

    audio.onended = () => setIsPlayingUserAudio(false);
    audio.onerror = () => setIsPlayingUserAudio(false);
    audio.play();
  };

  /**
   * 5. Pronounce Target Word with Slow AI Model
   */
  const handlePronounceTarget = (speed = modelSpeed) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlayingModel(true);

    const u = new SpeechSynthesisUtterance(targetText);
    u.rate = speed;
    u.pitch = settings.speechPitch || 1.0;

    u.onend = () => setIsPlayingModel(false);
    u.onerror = () => setIsPlayingModel(false);
    window.speechSynthesis.speak(u);
  };

  /**
   * 6. Handle File Voice Note Upload
   */
  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);
    setSpokenText('');
    setMatchScore(null);
    setFeedback(`Voice audio file "${file.name}" loaded successfully! Click "Play Patient Voice" to listen and compare with the slow model.`);
  };

  /**
   * 7. Evaluate Pronunciation
   */
  const evaluateMatch = (spoken, target) => {
    const { score, feedback: fb } = calculatePronunciationScore(spoken, target);
    setMatchScore(score);
    setFeedback(fb);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTypedText.trim()) return;
    setSpokenText(manualTypedText.trim());
    evaluateMatch(manualTypedText.trim(), targetText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
           style={{
             backgroundColor: 'var(--card-bg)',
             borderColor: 'var(--border-color)',
             color: 'var(--text-main)'
           }}>
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                 style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Voice Pronunciation Practice</h3>
              <p className="text-[11px] opacity-75">Dyslexia Audio Feedback & Practice</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAllMedia();
              onClose();
            }}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Live Mic vs Upload Voice Note vs Manual Check) */}
        <div className="flex border-b text-xs font-bold"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('mic')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'mic' ? 'border-emerald-600 font-extrabold text-emerald-700 dark:text-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
            }`}>
            <Mic className="w-3.5 h-3.5" />
            <span>Laptop Microphone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'upload' ? 'border-emerald-600 font-extrabold text-emerald-700 dark:text-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
            }`}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Voice Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'manual' ? 'border-emerald-600 font-extrabold text-emerald-700 dark:text-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
            }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Self-Check</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Target Word Display & Slow Model Audio */}
          <div className="p-4 rounded-xl border text-center space-y-3"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <div className="text-xs opacity-75 font-bold uppercase tracking-wider">Target Vocabulary</div>
            <div className="text-2xl sm:text-3xl font-black capitalize tracking-wide">{targetText}</div>
            
            {/* Speed Presets */}
            <div className="flex items-center justify-center space-x-1.5">
              {[
                { speed: 0.45, label: '0.45x Ultra-Slow' },
                { speed: 0.60, label: '0.60x Slow & Clear' },
                { speed: 0.85, label: '0.85x Normal' }
              ].map(opt => (
                <button
                  key={opt.speed}
                  onClick={() => {
                    setModelSpeed(opt.speed);
                    handlePronounceTarget(opt.speed);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    modelSpeed === opt.speed
                      ? 'ring-2 ring-emerald-500 font-black shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: modelSpeed === opt.speed ? 'var(--accent-color)' : 'var(--card-bg)',
                    color: modelSpeed === opt.speed ? 'var(--accent-text)' : 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Play Slow Model Button */}
            <button
              onClick={() => handlePronounceTarget()}
              disabled={isPlayingModel}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all ${
                isPlayingModel ? 'scale-105 ring-4 ring-amber-400' : 'hover:scale-[1.01]'
              }`}
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
              <Volume2 className={`w-4 h-4 ${isPlayingModel ? 'animate-bounce' : ''}`} />
              <span>{isPlayingModel ? 'Playing Slow Model Audio...' : 'Listen to Slow Model Audio'}</span>
            </button>
          </div>

          {/* TAB 1: Live Laptop Microphone */}
          {activeTab === 'mic' && (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl border space-y-4"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              
              {/* Live Volume Meter */}
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-[11px] font-bold opacity-75">
                  <span className="flex items-center space-x-1">
                    <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500 animate-pulse' : 'opacity-40'}`} />
                    <span>Laptop Microphone:</span>
                  </span>
                  <span>{isRecording ? `${volumeLevel}% active` : micPermissionGranted ? 'Ready to Record' : 'Permission Required'}</span>
                </div>
                
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden border"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <div
                    className="h-full transition-all duration-75 rounded-full"
                    style={{
                      width: `${isRecording ? Math.max(10, volumeLevel) : micPermissionGranted ? 20 : 0}%`,
                      backgroundColor: isRecording ? (volumeLevel > 50 ? '#10B981' : '#F59E0B') : 'var(--accent-color)'
                    }}
                  />
                </div>
              </div>

              {/* Big Record Button */}
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="w-20 h-20 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}
                  title="Click to Record Microphone Audio">
                  <Mic className="w-9 h-9 transition-transform group-hover:scale-110" />
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="w-20 h-20 rounded-full shadow-2xl flex items-center justify-center bg-red-600 text-white animate-pulse ring-8 ring-red-200 transition-all hover:scale-105"
                  title="Click to Stop Recording">
                  <div className="w-7 h-7 bg-white rounded-md" />
                </button>
              )}

              <div className="text-center">
                <p className="font-bold text-sm">
                  {isRecording ? 'Listening & recording... Tap square to finish' : 'Tap microphone & speak into your laptop'}
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  {isRecording ? 'Speak clearly at your own pace' : 'Takes 2-3 seconds'}
                </p>
              </div>

              {/* Step-by-Step Permission Resolver Guide if blocked */}
              {showPermissionGuide && (
                <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3">
                  <div className="flex items-start space-x-2 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>How to Enable Microphone Access on your Laptop:</span>
                  </div>

                  <div className="space-y-1.5 pl-6 list-decimal font-medium text-[11px] leading-relaxed">
                    <div>
                      <strong>Step 1 (Browser):</strong> Look at your browser address bar (top left of <code>http://localhost:3000</code>). Click the <strong>🔒 Lock or ⚙️ Settings</strong> icon next to the URL.
                    </div>
                    <div>
                      <strong>Step 2:</strong> Find <strong>Microphone</strong> and toggle it from <em>Blocked</em> to <strong>Allow</strong>.
                    </div>
                    <div>
                      <strong>Step 3 (Windows Settings):</strong> If still blocked, open Windows <em>Settings &rarr; Privacy & Security &rarr; Microphone</em> and ensure <em>"Let desktop apps access your microphone"</em> is turned <strong>ON</strong>.
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={requestMicrophoneAccess}
                      className="px-3 py-1.5 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-800 transition-colors flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>I've Allowed It &mdash; Retry Mic</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 bg-white border border-amber-400 text-amber-950 rounded-lg font-bold hover:bg-amber-100 transition-colors flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Voice Note Instead</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Upload Voice Note File */}
          {activeTab === 'upload' && (
            <div className="p-5 rounded-xl border space-y-4 text-center"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center border shadow-xs"
                   style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                <FileAudio className="w-6 h-6 text-indigo-600" />
              </div>

              <div>
                <h4 className="font-bold text-sm">Upload Patient Audio Recording</h4>
                <p className="text-xs opacity-75 mt-0.5">
                  Select an audio file recorded from your phone, laptop voice recorder, or WhatsApp (.m4a, .mp3, .wav, .webm)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg"
                onChange={handleAudioFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-5 rounded-xl font-bold text-xs shadow-md inline-flex items-center space-x-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
                <Upload className="w-4 h-4" />
                <span>Choose Audio File from Laptop</span>
              </button>
            </div>
          )}

          {/* TAB 3: Self-Check & Assisted Evaluation */}
          {activeTab === 'manual' && (
            <div className="p-4 rounded-xl border space-y-3"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <div>
                <h4 className="font-bold text-sm">Self-Evaluation & Speech Check</h4>
                <p className="text-xs opacity-75">
                  Listen to the model pronunciation, speak the word aloud, and evaluate clarity:
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualTypedText}
                    onChange={(e) => setManualTypedText(e.target.value)}
                    placeholder={`Type word as spoken (e.g. ${targetText})`}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg font-bold text-xs"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>
                    Verify
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => evaluateMatch(targetText, targetText)}
                  className="p-2.5 rounded-lg border font-bold text-xs bg-emerald-100 text-emerald-900 border-emerald-300 flex items-center justify-center space-x-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pronounced Clearly (100%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpokenText('Practice needed');
                    setMatchScore(50);
                    setFeedback('Keep practicing! Listen to the slow model below to master each syllable.');
                  }}
                  className="p-2.5 rounded-lg border font-bold text-xs bg-amber-100 text-amber-900 border-amber-300 flex items-center justify-center space-x-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Struggled / Need Practice</span>
                </button>
              </div>
            </div>
          )}

          {/* User Spoken Transcript if available */}
          {spokenText && (
            <div className="p-3.5 rounded-xl border text-center"
                 style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <span className="opacity-60 text-xs font-semibold block">Recognized Voice:</span>
              <span className="font-black text-lg">"{spokenText}"</span>
            </div>
          )}

          {/* Recorded Voice Audio Player */}
          {recordedAudioUrl && (
            <div className="p-4 rounded-xl border space-y-2.5"
                 style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center space-x-1.5">
                  <Ear className="w-3.5 h-3.5 text-purple-600" />
                  <span>Speech Comparison: Patient vs Model</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Audio Captured
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePlayUserVoice}
                  disabled={isPlayingUserAudio}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    isPlayingUserAudio ? 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-900' : 'hover:scale-[1.01]'
                  }`}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  <Play className="w-4 h-4 text-emerald-600" />
                  <span>{isPlayingUserAudio ? 'Playing Your Voice...' : 'Play Patient Voice'}</span>
                </button>

                <button
                  onClick={() => handlePronounceTarget()}
                  disabled={isPlayingModel}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    isPlayingModel ? 'ring-2 ring-amber-400 bg-amber-100 text-amber-900' : 'hover:scale-[1.01]'
                  }`}
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Play Slow Model</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Score Card */}
          {matchScore !== null && (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
              matchScore >= 75
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
            }`}>
              {matchScore >= 75 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-extrabold text-sm flex items-center justify-between">
                  <span>Pronunciation Accuracy Score</span>
                  <span className="text-base font-black">{matchScore}%</span>
                </div>
                <p className="text-xs font-medium mt-1 leading-relaxed">{feedback}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
