import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Workflow,
  CheckCircle2,
  RefreshCw,
  Info,
  Layers,
  Volume2,
  VolumeX,
  RotateCcw,
  Repeat,
  Lightbulb,
  Sun,
  Cloud,
  CloudRain,
  Waves,
  Leaf,
  Zap,
  Activity,
  Heart,
  BookOpen,
  GitFork,
  Check,
  Building,
  Cpu,
  Key,
  HelpCircle,
  Play,
  Pause,
  Target,
  Maximize2,
  Eye
} from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import './VisualUnderstanding.css';

// Context icon matcher based on keywords
function getContextIcon(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('sun') || lower.includes('solar') || lower.includes('light') || lower.includes('photonic')) return 'sun';
  if (lower.includes('rain') || lower.includes('precipitation') || lower.includes('drop')) return 'rain';
  if (lower.includes('cloud') || lower.includes('vapor') || lower.includes('condens') || lower.includes('air') || lower.includes('atmosphere')) return 'cloud';
  if (lower.includes('water') || lower.includes('ocean') || lower.includes('sea') || lower.includes('river') || lower.includes('liquid') || lower.includes('fluid') || lower.includes('hydraul')) return 'waves';
  if (lower.includes('plant') || lower.includes('leaf') || lower.includes('chlorophyll') || lower.includes('chloroplast') || lower.includes('bio') || lower.includes('flower') || lower.includes('tree')) return 'leaf';
  if (lower.includes('energy') || lower.includes('atp') || lower.includes('reaction') || lower.includes('electric') || lower.includes('power') || lower.includes('action')) return 'zap';
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('blood') || lower.includes('arter') || lower.includes('vein')) return 'heart';
  if (lower.includes('brain') || lower.includes('neuron') || lower.includes('neural') || lower.includes('comput') || lower.includes('ai') || lower.includes('weight') || lower.includes('algorithm')) return 'cpu';
  if (lower.includes('city') || lower.includes('urban') || lower.includes('civiliz') || lower.includes('settle') || lower.includes('brick') || lower.includes('build') || lower.includes('architect')) return 'building';
  if (lower.includes('oxygen') || lower.includes('gas') || lower.includes('health') || lower.includes('pulse') || lower.includes('vital')) return 'activity';
  if (lower.includes('earthquake') || lower.includes('tectonic') || lower.includes('plate') || lower.includes('seismic') || lower.includes('crust') || lower.includes('fault')) return 'zap';
  if (lower.includes('result') || lower.includes('product') || lower.includes('outcome') || lower.includes('success') || lower.includes('adopt')) return 'check';
  return 'lightbulb';
}

// Render icon helper
function renderNodeIcon(iconName) {
  switch (iconName) {
    case 'sun': return <Sun className="w-5 h-5 text-amber-500" />;
    case 'cloud': return <Cloud className="w-5 h-5 text-sky-500" />;
    case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
    case 'waves': return <Waves className="w-5 h-5 text-cyan-600" />;
    case 'leaf': return <Leaf className="w-5 h-5 text-emerald-500" />;
    case 'zap': return <Zap className="w-5 h-5 text-yellow-500" />;
    case 'activity': return <Activity className="w-5 h-5 text-rose-500" />;
    case 'heart': return <Heart className="w-5 h-5 text-red-500" />;
    case 'cpu': return <Cpu className="w-5 h-5 text-indigo-500" />;
    case 'building': return <Building className="w-5 h-5 text-amber-600" />;
    case 'check': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    default: return <Workflow className="w-5 h-5 text-indigo-500" />;
  }
}

/**
 * Generate a short, meaningful, dyslexia-friendly section title from a sentence/paragraph
 */
function deriveFriendlySectionTitle(sentence, index, total, mainTopic) {
  const lower = sentence.toLowerCase();
  
  // Clean leading transitional conjunctions
  const clean = sentence
    .replace(/^(furthermore|moreover|consequently|subsequently|in addition|therefore|simultaneously|notwithstanding|meanwhile)[,\s]*/i, '')
    .trim();

  // 1. Definition / Overview check for first section
  if (index === 0) {
    if (lower.includes('what is') || lower.includes('is a') || lower.includes('are ') || lower.includes('refers to') || lower.includes('fundamental') || lower.includes('demonstrates') || lower.includes('operates')) {
      return `What is ${mainTopic}?`;
    }
    return `Overview of ${mainTopic}`;
  }

  // 2. Keyword & Concept-based friendly title derivation
  if (lower.includes('chloroplast') || lower.includes('chlorophyll') || lower.includes('pigment')) {
    return 'Chloroplasts & Solar Absorption';
  }
  if (lower.includes('solar') || lower.includes('sunlight') || lower.includes('photonic')) {
    return 'Solar Energy & Leaves';
  }
  if (lower.includes('oxygen') || lower.includes('atp') || lower.includes('byproduct') || lower.includes('release')) {
    return 'Oxygen & Energy Release';
  }
  if (lower.includes('drainage') || lower.includes('hydraulic') || lower.includes('subterranean')) {
    return 'Hydraulic Drainage Systems';
  }
  if (lower.includes('brick') || lower.includes('urban') || lower.includes('architecture') || lower.includes('settlement')) {
    return 'Planned Urban Architecture';
  }
  if (lower.includes('commerce') || lower.includes('trade') || lower.includes('amenities') || lower.includes('maritime')) {
    return 'Public Amenities & Trade';
  }
  if (lower.includes('backpropagation') || lower.includes('weight') || lower.includes('epoch') || lower.includes('train')) {
    return 'Weight Training & Optimization';
  }
  if (lower.includes('neuron') || lower.includes('cerebral') || lower.includes('emulate')) {
    return 'Emulating Biological Neurons';
  }
  if (lower.includes('vision') || lower.includes('language') || lower.includes('deep learning') || lower.includes('ubiquitous')) {
    return 'Modern AI Applications';
  }
  if (lower.includes('valve') || lower.includes('regurgitation') || lower.includes('cardiac')) {
    return 'Cardiac Valve Protection';
  }
  if (lower.includes('arterial') || lower.includes('pressure') || lower.includes('lipid') || lower.includes('homeostasis')) {
    return 'Blood Pressure & Homeostasis';
  }
  if (lower.includes('evaporat') || lower.includes('vapor') || lower.includes('heat')) {
    return 'Solar Evaporation';
  }
  if (lower.includes('condens') || lower.includes('cloud') || lower.includes('cool')) {
    return 'Cloud Condensation';
  }
  if (lower.includes('precipitat') || lower.includes('rain') || lower.includes('snow')) {
    return 'Precipitation & Rainfall';
  }
  if (lower.includes('collect') || lower.includes('ocean') || lower.includes('lake') || lower.includes('restart')) {
    return 'Water Collection & Cycle Loop';
  }
  if (lower.includes('tectonic') || lower.includes('plate') || lower.includes('crust')) {
    return 'Tectonic Plates & Crust';
  }
  if (lower.includes('seismic') || lower.includes('wave') || lower.includes('fault')) {
    return 'Seismic Wave Propagation';
  }

  // 3. Structural fallback based on position
  if (index === total - 1) {
    return 'Final Outcome & Results';
  }

  // 4. Extract subject noun phrase from the clean sentence
  const words = clean.split(/\s+/).slice(0, 4);
  const phrase = words.join(' ').replace(/[,;:.]$/, '');
  if (phrase.length > 3 && phrase.length < 32) {
    return phrase.charAt(0).toUpperCase() + phrase.slice(1);
  }

  return `Key Mechanism ${index + 1}`;
}

/**
 * Local Passage-to-Sections Analyzer Engine
 */
function analyzePassageSections(rawTitle, passageText, paragraphs = [], difficultWords = []) {
  // 1. Gather full text
  let fullText = (passageText || '').trim();
  if (!fullText && paragraphs.length > 0) {
    fullText = paragraphs.map(p => p.simplifiedText || p.text || '').join(' ').trim();
  }

  // Fallback for empty or extremely short text
  if (!fullText || fullText.split(/\s+/).length < 5) {
    return {
      isLimited: true,
      topic: rawTitle || 'Reading Passage',
      isCycle: false,
      sections: [],
      causeEffectStages: { causes: [], processes: [], effects: [] },
      keyPoints: [],
      importantTerms: [],
      simpleSummary: 'Visual representation is limited for this short passage.'
    };
  }

  // 2. Clean & Derive Main Topic
  let cleanTopic = (rawTitle || '')
    .replace(/\s*\([^)]*\)/g, '') // remove "(Biology)", "(History)", etc.
    .replace(/^(Chapter|Section|Unit|Document|Passage)\s*\d*[:\-]?\s*/i, '')
    .trim();

  // Split into sentences
  const sentences = fullText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  if (!cleanTopic || cleanTopic === 'Current Document' || cleanTopic === 'Untitled Document') {
    if (sentences.length > 0) {
      const firstS = sentences[0];
      const match = firstS.match(/^([A-Z][a-zA-Z\s]{2,35}?)(?:\s+(?:is|are|was|were|refers to|represents|demonstrates|operates|functions|takes place))/i);
      cleanTopic = match ? match[1].trim() : firstS.split(/\s+/).slice(0, 4).join(' ') + '...';
    } else {
      cleanTopic = 'Reading Topic';
    }
  }

  // 3. Detect Cycle
  const isCycle = /\b(cycle|cycles|circular|circulation|circulates|circulate|repeats|repeating|loop|loops|recirculate|continuous loop|restart)\b/i.test(fullText);

  // 4. Construct Conceptual Sections (3 to 6 sections)
  let rawSectionChunks = [];
  if (paragraphs.length >= 2) {
    rawSectionChunks = paragraphs.map(p => (p.simplifiedText || p.text || '').trim()).filter(Boolean);
  } else if (sentences.length >= 2) {
    rawSectionChunks = sentences.slice(0, 6);
  } else {
    rawSectionChunks = [fullText];
  }

  const totalSections = Math.min(rawSectionChunks.length, 6);
  const sections = rawSectionChunks.slice(0, totalSections).map((chunkText, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === totalSections - 1;

    // Derive friendly section title
    const sectionTitle = deriveFriendlySectionTitle(chunkText, idx, totalSections, cleanTopic);

    // Determine Role
    let role = `Section ${idx + 1}`;
    if (isFirst) {
      role = isCycle ? 'Cycle Stage 1' : 'Overview & Foundation';
    } else if (isLast) {
      role = isCycle ? 'Cycle Completion' : 'Main Result & Impact';
    } else if (/\b(furthermore|moreover|in addition|simultaneously|also|valve|weights|drainage|contain)\b/i.test(chunkText)) {
      role = 'Key Mechanism';
    } else {
      role = 'Core Process';
    }

    // Extract concept keyword pills from the section chunk
    const keyPhrases = chunkText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\b(?:chloroplasts|chlorophyll|oxygen|carbon dioxide|glucose|ATP|brick architecture|hydraulic drainage|maritime commerce|neural networks|backpropagation|weights|cardiac valves|blood pressure|evaporation|condensation|precipitation|collection|tectonic plates|seismic waves)\b)/gi) || [];
    const uniquePhrases = [...new Set(keyPhrases.map(k => k.trim()))];
    const concepts = uniquePhrases.length > 0 ? uniquePhrases.slice(0, 3) : [`Section ${idx + 1} Concept`];

    // Find any important terms belonging specifically to this section
    const sectionTerms = [];
    if (Array.isArray(difficultWords)) {
      difficultWords.forEach(dw => {
        const word = dw.originalWord || dw.word;
        if (word && chunkText.toLowerCase().includes(word.toLowerCase())) {
          sectionTerms.push(word);
        }
      });
    }

    // Extract key idea sentence
    const chunkSentences = chunkText.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 5);
    const keyIdea = chunkSentences.length > 1
      ? chunkSentences[0].replace(/^(furthermore|moreover|consequently|subsequently|in addition|therefore)[,\s]*/i, '').trim()
      : null;

    return {
      id: `section-${idx + 1}`,
      sectionNumber: idx + 1,
      title: sectionTitle,
      role,
      explanation: chunkText,
      keyIdea: keyIdea && keyIdea !== chunkText ? keyIdea : null,
      concepts,
      sectionTerms: sectionTerms.slice(0, 3),
      icon: getContextIcon(chunkText)
    };
  });

  // 5. Group Cause & Effect Stages for Sections
  const causes = [];
  const processes = [];
  const effects = [];

  sections.forEach((sec, i) => {
    if (i === 0 || sec.role.includes('Foundation') || sec.role.includes('Stage 1')) {
      causes.push(sec);
    } else if (i === sections.length - 1 || sec.role.includes('Result') || sec.role.includes('Completion') || sec.role.includes('Impact')) {
      effects.push(sec);
    } else {
      processes.push(sec);
    }
  });

  if (causes.length === 0 && sections.length > 0) causes.push(sections[0]);
  if (effects.length === 0 && sections.length > 1) effects.push(sections[sections.length - 1]);
  if (processes.length === 0 && sections.length > 2) processes.push(sections[1]);

  // 6. Extract Key Points (3-5 takeaway bullets)
  const keyPoints = sentences.slice(0, 5).map(sentence => {
    const cleaned = sentence
      .replace(/^(furthermore|moreover|consequently|subsequently|in addition|therefore|simultaneously|notwithstanding)[,\s]*/i, '')
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });

  // 7. Extract Important Terms for standalone phonological pronunciation
  const termsMap = new Map();
  if (Array.isArray(difficultWords) && difficultWords.length > 0) {
    difficultWords.forEach(dw => {
      const word = dw.originalWord || dw.word;
      if (word && !termsMap.has(word.toLowerCase())) {
        termsMap.set(word.toLowerCase(), {
          term: word,
          context: dw.definition || `Vocabulary term from the passage.`
        });
      }
    });
  }

  const termCandidates = fullText.match(/\b([A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})*|\b[a-z]{7,}\b)/g) || [];
  const commonStopWords = new Set(['furthermore', 'moreover', 'consequently', 'subsequently', 'predominantly', 'advantageous', 'demonstrates', 'extraordinary', 'investigations', 'substantiate', 'computational', 'facilitating', 'continuously', 'notwithstanding', 'simultaneously', 'subterranean', 'intricate', 'surrounding', 'architectures']);

  for (const tc of termCandidates) {
    const lower = tc.toLowerCase();
    if (termsMap.size >= 6) break;
    if (!commonStopWords.has(lower) && !termsMap.has(lower) && lower.length > 4) {
      const foundSentence = sentences.find(s => s.toLowerCase().includes(lower)) || fullText;
      const wordsAround = foundSentence.split(/\s+/).slice(0, 9).join(' ') + '...';
      termsMap.set(lower, {
        term: tc.charAt(0).toUpperCase() + tc.slice(1),
        context: wordsAround
      });
    }
  }

  const importantTerms = Array.from(termsMap.values()).slice(0, 6);

  // 8. Plain English 1-2 sentence summary
  let simpleSummary = '';
  if (sentences.length === 1) {
    simpleSummary = sentences[0];
  } else if (sentences.length >= 2) {
    const firstPoint = sentences[0].replace(/^(furthermore|moreover|consequently)[,\s]*/i, '').trim();
    const lastPoint = sentences[sentences.length - 1].replace(/^(furthermore|moreover|consequently)[,\s]*/i, '').trim();
    simpleSummary = `${firstPoint} Consequently, ${lastPoint.charAt(0).toLowerCase() + lastPoint.slice(1)}`;
  } else {
    simpleSummary = `${cleanTopic} forms an interconnected system that coordinates key steps to produce a clear outcome.`;
  }

  return {
    isLimited: false,
    topic: cleanTopic,
    isCycle,
    sections,
    causeEffectStages: { causes, processes, effects },
    keyPoints,
    importantTerms,
    simpleSummary
  };
}

export default function VisualUnderstanding({
  documentTitle = 'Current Document',
  simplifiedText = '',
  rawText = '',
  paragraphs = [],
  difficultWords = []
}) {
  // Reading settings safe access
  let settings = {};
  try {
    const ctx = useReadingSettings();
    settings = ctx?.settings || {};
  } catch {
    settings = {};
  }

  // 1. Analyze actual passage content into structured sections
  const analysis = useMemo(() => {
    return analyzePassageSections(documentTitle, simplifiedText, paragraphs, difficultWords);
  }, [documentTitle, simplifiedText, paragraphs, difficultWords]);

  // Visualization mode: 'mindmap' | 'focus' | 'flow' | 'cause_effect' | 'cycle'
  const defaultMode = analysis.isCycle ? 'cycle' : 'mindmap';
  const [visMode, setVisMode] = useState(defaultMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [speakingKey, setSpeakingKey] = useState(null);

  // Sync mode & active section when passage changes
  useEffect(() => {
    if (analysis.isCycle) {
      setVisMode('cycle');
    } else {
      setVisMode('mindmap');
    }
    setActiveSectionIndex(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingKey(null);
    }
  }, [analysis.topic, analysis.isCycle]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Section Voice Guidance: "Section X. [Section Title]. [Section Explanation]."
  const handleSpeakSection = (section) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const keyId = `section-${section.sectionNumber}`;
    if (speakingKey === keyId) {
      setSpeakingKey(null);
      return;
    }

    setSpeakingKey(keyId);

    // Speak in strict format: "Section X. [Title]. [Explanation]"
    const speechText = `Section ${section.sectionNumber}. ${section.title}. ${section.explanation}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = settings.speechRate || 0.85;
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // General Speech helper (for individual terms or summary)
  const handleSpeakGeneral = (textToSpeak, keyId, isSlowWord = false) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingKey === keyId) {
      setSpeakingKey(null);
      return;
    }

    setSpeakingKey(keyId);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = isSlowWord
      ? (settings.wordAudioSpeed || 0.65)
      : (settings.speechRate || 0.85);
    utterance.pitch = settings.speechPitch || 1.0;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    window.speechSynthesis.speak(utterance);
  };

  // Section Navigation Handlers
  const handleSelectSection = (index) => {
    if (index >= 0 && index < analysis.sections.length) {
      setActiveSectionIndex(index);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingKey(null);
      }
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      handleSelectSection(activeSectionIndex - 1);
    }
  };

  const handleNextSection = () => {
    if (activeSectionIndex < analysis.sections.length - 1) {
      handleSelectSection(activeSectionIndex + 1);
    }
  };

  const handleTriggerFocusMode = (index) => {
    handleSelectSection(index);
    setVisMode('focus');
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActiveSectionIndex(0);
    }, 350);
  };

  const activeSection = analysis.sections[activeSectionIndex] || analysis.sections[0];
  const isSpeakingActiveSection = activeSection && speakingKey === `section-${activeSection.sectionNumber}`;

  return (
    <div
      className="visual-understanding-card mt-8 p-5 sm:p-7 rounded-2xl border shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      }}>
      
      {/* 1. Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5"
           style={{ borderColor: 'var(--border-color)' }}>
        
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold mb-1.5"
               style={{
                 backgroundColor: 'var(--flag-bg)',
                 color: 'var(--flag-text)',
                 border: '1px solid var(--flag-border)'
               }}>
            <Workflow className="w-3.5 h-3.5" />
            <span>SEE → FOCUS → READ → LISTEN → UNDERSTAND</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center space-x-2">
            <span>Visual Understanding: {analysis.topic}</span>
          </h2>
          
          <p className="text-xs sm:text-sm opacity-80 mt-1 max-w-2xl leading-relaxed">
            Explaining your reading passage through structured conceptual sections with voice guidance and calm focus reading.
          </p>
        </div>

        {/* Refresh / Regenerate Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 shadow-md transition-all ${
              isGenerating
                ? 'opacity-70 cursor-wait'
                : 'hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--accent-text)'
            }}>
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Re-analyzing Sections...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Visualization</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Mode Selector Tabs */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 p-1 rounded-xl border"
             style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
          
          <button
            type="button"
            onClick={() => setVisMode('mindmap')}
            className={`vu-mode-tab px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              visMode === 'mindmap' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: visMode === 'mindmap' ? 'var(--accent-color)' : 'transparent',
              color: visMode === 'mindmap' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            <GitFork className="w-3.5 h-3.5" />
            <span>🌳 Mind Map</span>
          </button>

          {/* 🎯 Focus Reading Tab */}
          <button
            type="button"
            onClick={() => setVisMode('focus')}
            className={`vu-mode-tab px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              visMode === 'focus' ? 'shadow-xs ring-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: visMode === 'focus' ? 'var(--accent-color)' : 'transparent',
              color: visMode === 'focus' ? 'var(--accent-text)' : 'var(--text-main)'
            }}
            title="Focus Reading Mode (One section at a time)">
            <Target className="w-3.5 h-3.5" />
            <span>🎯 Focus Reading</span>
          </button>

          <button
            type="button"
            onClick={() => setVisMode('flow')}
            className={`vu-mode-tab px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              visMode === 'flow' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: visMode === 'flow' ? 'var(--accent-color)' : 'transparent',
              color: visMode === 'flow' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>➡️ Flow / Process</span>
          </button>

          <button
            type="button"
            onClick={() => setVisMode('cause_effect')}
            className={`vu-mode-tab px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              visMode === 'cause_effect' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: visMode === 'cause_effect' ? 'var(--accent-color)' : 'transparent',
              color: visMode === 'cause_effect' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            <Zap className="w-3.5 h-3.5" />
            <span>🔗 Cause & Effect</span>
          </button>

          <button
            type="button"
            onClick={() => setVisMode('cycle')}
            className={`vu-mode-tab px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              visMode === 'cycle' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: visMode === 'cycle' ? 'var(--accent-color)' : 'transparent',
              color: visMode === 'cycle' ? 'var(--accent-text)' : 'var(--text-main)'
            }}>
            <Repeat className="w-3.5 h-3.5" />
            <span>🔄 Cycle</span>
            {analysis.isCycle && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {analysis.isCycle && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border-emerald-300">
            <Repeat className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Repeating Cycle Detected</span>
          </span>
        )}
      </div>

      {/* 3. Section Navigation Bar */}
      {analysis.sections.length > 0 && !analysis.isLimited && (
        <div className="mt-4 vu-section-nav p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          
          {/* Previous Section Button */}
          <button
            type="button"
            onClick={handlePrevSection}
            disabled={activeSectionIndex === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Section</span>
          </button>

          {/* Center: Section Indicator, Focus Trigger & Primary Voice Button */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full border"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              Section {activeSectionIndex + 1} of {analysis.sections.length}
            </span>

            {visMode !== 'focus' && (
              <button
                type="button"
                onClick={() => setVisMode('focus')}
                className="px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1 hover:opacity-90 transition-opacity shadow-xs"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--accent-color)',
                  color: 'var(--text-main)'
                }}>
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Focus on This Section</span>
              </button>
            )}

            {activeSection && (
              <button
                type="button"
                onClick={() => handleSpeakSection(activeSection)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 border shadow-sm transition-all ${
                  isSpeakingActiveSection
                    ? 'bg-amber-400 text-amber-950 scale-105 ring-2 ring-amber-500'
                    : 'hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{
                  backgroundColor: isSpeakingActiveSection ? '#F59E0B' : 'var(--accent-color)',
                  borderColor: 'var(--border-color)',
                  color: isSpeakingActiveSection ? '#000000' : 'var(--accent-text)'
                }}
                title={`Listen to Section ${activeSection.sectionNumber}: ${activeSection.title}`}>
                <Volume2 className={`w-3.5 h-3.5 ${isSpeakingActiveSection ? 'animate-bounce' : ''}`} />
                <span>{isSpeakingActiveSection ? `Speaking Section ${activeSection.sectionNumber}...` : '🔊 Listen to Section'}</span>
              </button>
            )}
          </div>

          {/* Next Section Button */}
          <button
            type="button"
            onClick={handleNextSection}
            disabled={activeSectionIndex === analysis.sections.length - 1}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}>
            <span>Next Section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Dedicated Visual Diagram / Focus Reading Area */}
      <div
        className="mt-5 p-4 sm:p-6 rounded-2xl border min-h-[300px] flex flex-col justify-center transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-main)',
          borderColor: 'var(--border-color)'
        }}>
        
        {analysis.isLimited ? (
          <div className="text-center py-8 px-4 space-y-2">
            <Info className="w-8 h-8 mx-auto text-amber-500" />
            <h3 className="font-bold text-base">Visual representation is limited for this passage.</h3>
            <p className="text-xs opacity-80 max-w-md mx-auto">
              Please provide or select a more descriptive passage to generate section-based visual mind maps and focus reading.
            </p>
          </div>
        ) : (
          <div className="vu-animated-fade-in space-y-6">
            
            {/* =========================================================
                🎯 FOCUS READING MODE PANEL (CALM & CLUTTER-FREE)
               ========================================================= */}
            {visMode === 'focus' && activeSection && (
              <div className="vu-focus-reading-panel vu-animated-fade-in text-left space-y-5">
                
                {/* Top Section Counter & Back Navigation */}
                <div className="flex items-center justify-between pb-3 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2">
                    <span className="vu-section-badge px-3 py-1 rounded-full font-black text-xs">
                      Section {activeSection.sectionNumber} of {analysis.sections.length}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-65">
                      {activeSection.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVisMode('mindmap')}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 hover:opacity-85 transition-opacity"
                    style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Back to Mind Map</span>
                  </button>
                </div>

                {/* Large Clean Section Title */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl border shrink-0"
                         style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                      {renderNodeIcon(activeSection.icon)}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight"
                        style={{ color: 'var(--text-main)' }}>
                      {activeSection.title}
                    </h3>
                  </div>
                </div>

                {/* Optional Subtle Key Idea Treatment */}
                {activeSection.keyIdea && (
                  <div className="vu-focus-key-idea-box flex items-start space-x-2.5 shadow-xs">
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block mb-0.5">
                        Key Idea:
                      </span>
                      <p className="text-xs sm:text-sm font-bold leading-relaxed">
                        {activeSection.keyIdea}
                      </p>
                    </div>
                  </div>
                )}

                {/* Calm, Large Readable Section Paragraph */}
                <div className="p-4 sm:p-5 rounded-2xl border shadow-inner"
                     style={{
                       backgroundColor: 'var(--bg-main)',
                       borderColor: 'var(--border-color)'
                     }}>
                  <p className="vu-focus-body-text font-medium leading-loose"
                     style={{
                       fontFamily: settings.font === 'OpenDyslexic' ? '"OpenDyslexic", sans-serif' : settings.font === 'Lexend' ? '"Lexend", sans-serif' : 'inherit'
                     }}>
                    {activeSection.explanation}
                  </p>
                </div>

                {/* Section Voice & Navigation Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t"
                     style={{ borderColor: 'var(--border-color)' }}>
                  
                  {/* Primary Voice Listen Button */}
                  <button
                    type="button"
                    onClick={() => handleSpeakSection(activeSection)}
                    className={`px-5 py-3 rounded-xl text-sm font-black flex items-center space-x-2.5 border shadow-md transition-all ${
                      isSpeakingActiveSection
                        ? 'bg-amber-400 text-amber-950 scale-105 ring-2 ring-amber-500'
                        : 'hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={{
                      backgroundColor: isSpeakingActiveSection ? '#F59E0B' : 'var(--accent-color)',
                      borderColor: 'var(--border-color)',
                      color: isSpeakingActiveSection ? '#000000' : 'var(--accent-text)'
                    }}>
                    <Volume2 className={`w-4 h-4 ${isSpeakingActiveSection ? 'animate-bounce' : ''}`} />
                    <span>{isSpeakingActiveSection ? `Speaking Section ${activeSection.sectionNumber}...` : '🔊 Listen to Section'}</span>
                  </button>

                  {/* Previous / Next Navigation Buttons */}
                  <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <button
                      type="button"
                      onClick={handlePrevSection}
                      disabled={activeSectionIndex === 0}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextSection}
                      disabled={activeSectionIndex === analysis.sections.length - 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================
                MODE A: 🌳 SECTION-BASED MIND MAP
               ========================================================= */}
            {visMode === 'mindmap' && (
              <div className="space-y-6 py-2">
                
                {/* Mind Map Sub-header */}
                <div className="flex items-center justify-between pb-2 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      🌳 Section-Based Concept Mind Map
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)' }}>
                      {analysis.sections.length} Conceptual Sections
                    </span>
                  </div>

                  <div className="text-[11px] opacity-70 font-semibold flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Click any section branch to focus & listen</span>
                  </div>
                </div>

                {/* Central Topic Node */}
                <div className="flex justify-center">
                  <div
                    className="vu-mindmap-center-node p-4 sm:p-5 rounded-2xl text-center max-w-md w-full shadow-lg cursor-pointer"
                    onClick={() => handleSelectSection(0)}>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">
                      Main Passage Topic
                    </div>
                    <div className="font-black text-lg sm:text-xl flex items-center justify-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{analysis.topic}</span>
                    </div>
                    <div className="text-xs opacity-90 mt-1 font-medium">
                      Divided into {analysis.sections.length} Conceptual Sections
                    </div>
                  </div>
                </div>

                {/* SVG Branch Connector Lines */}
                <div className="hidden md:flex justify-center -my-3">
                  <svg className="w-full max-w-2xl h-10 opacity-70" viewBox="0 0 600 40" fill="none">
                    <path
                      d="M300,0 C300,20 100,20 100,40 M300,0 C300,20 230,20 230,40 M300,0 C300,20 370,20 370,40 M300,0 C300,20 500,20 500,40"
                      stroke="var(--accent-color)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Mind Map Section Branches Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {analysis.sections.map((section, index) => {
                    const isFocused = activeSectionIndex === index;
                    const isDimmed = activeSectionIndex !== null && !isFocused;
                    const isSpeakingThis = speakingKey === `section-${section.sectionNumber}`;

                    return (
                      <div
                        key={section.id}
                        onClick={() => handleSelectSection(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectSection(index); }}
                        className={`vu-section-card p-4 rounded-2xl cursor-pointer text-left ${
                          isFocused ? 'vu-node-focused' : ''
                        } ${isDimmed ? 'vu-node-dimmed' : ''}`}
                        aria-label={`Section ${section.sectionNumber}: ${section.title}`}>
                        
                        {/* Section Header: Badge & Role */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="vu-section-badge px-2 py-0.5 rounded-full font-black text-xs">
                            Section {section.sectionNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-65">
                            {section.role}
                          </span>
                        </div>

                        {/* Section Title */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-1.5 rounded-lg border shrink-0"
                               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                            {renderNodeIcon(section.icon)}
                          </div>
                          <div className="font-extrabold text-sm sm:text-base line-clamp-2 leading-snug">
                            {section.title}
                          </div>
                        </div>

                        {/* Section Concept Pills */}
                        {section.concepts && section.concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {section.concepts.map((concept, cIdx) => (
                              <span key={cIdx} className="vu-concept-pill px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                {concept}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Section Actions: Focus & Listen */}
                        <div className="pt-2.5 border-t flex items-center justify-between gap-1.5"
                             style={{ borderColor: 'var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerFocusMode(index);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
                            title="Open Focus Reading Mode for this section">
                            <Target className="w-3 h-3 text-emerald-600" />
                            <span>Focus</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSection(index);
                              handleSpeakSection(section);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 border transition-all ${
                              isSpeakingThis
                                ? 'bg-amber-400 text-amber-950 scale-105'
                                : 'hover:opacity-90'
                            }`}
                            style={{
                              backgroundColor: isSpeakingThis ? '#F59E0B' : 'var(--bg-main)',
                              borderColor: 'var(--border-color)',
                              color: isSpeakingThis ? '#000000' : 'var(--text-main)'
                            }}>
                            <Volume2 className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-bounce' : ''}`} />
                            <span>{isSpeakingThis ? 'Speaking...' : 'Listen'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================
                MODE B: ➡️ SEQUENTIAL SECTION FLOW
               ========================================================= */}
            {visMode === 'flow' && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between pb-2 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                    ➡️ Sequential Section Flow
                  </span>
                  <span className="text-[11px] opacity-70 font-semibold">
                    Step-by-Step Passage Flow
                  </span>
                </div>

                <div className="overflow-x-auto pb-4 pt-2">
                  <div className="flex items-center justify-start sm:justify-center min-w-max space-x-2.5 px-3">
                    {analysis.sections.map((section, index) => {
                      const isLast = index === analysis.sections.length - 1;
                      const isFocused = activeSectionIndex === index;
                      const isDimmed = activeSectionIndex !== null && !isFocused;
                      const isSpeakingThis = speakingKey === `section-${section.sectionNumber}`;

                      return (
                        <React.Fragment key={section.id}>
                          <div
                            onClick={() => handleSelectSection(index)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectSection(index); }}
                            className={`vu-node-box relative p-4 sm:p-5 rounded-2xl cursor-pointer w-56 sm:w-64 shrink-0 text-left ${
                              isFocused ? 'vu-node-focused' : ''
                            } ${isDimmed ? 'vu-node-dimmed' : ''}`}
                            aria-label={`Section ${section.sectionNumber}: ${section.title}`}>
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="vu-section-badge px-2 py-0.5 rounded-full font-black text-xs">
                                Section {section.sectionNumber}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                {section.role}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <div className="shrink-0 p-1.5 rounded-lg border"
                                   style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                {renderNodeIcon(section.icon)}
                              </div>
                              <div className="font-black text-sm sm:text-base line-clamp-2 leading-snug">
                                {section.title}
                              </div>
                            </div>

                            {/* Concept Pills */}
                            {section.concepts && section.concepts.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {section.concepts.map((concept, cIdx) => (
                                  <span key={cIdx} className="vu-concept-pill px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t gap-1.5"
                                 style={{ borderColor: 'var(--border-color)' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTriggerFocusMode(index);
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 hover:opacity-90"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <Target className="w-3 h-3 text-emerald-600" />
                                <span>Focus</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSection(index);
                                  handleSpeakSection(section);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 border transition-all ${
                                  isSpeakingThis ? 'bg-amber-400 text-amber-950 scale-105' : 'hover:opacity-90'
                                }`}
                                style={{
                                  backgroundColor: isSpeakingThis ? '#F59E0B' : 'var(--card-bg)',
                                  borderColor: 'var(--border-color)',
                                  color: isSpeakingThis ? '#000000' : 'var(--text-main)'
                                }}>
                                <Volume2 className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-bounce' : ''}`} />
                                <span>{isSpeakingThis ? 'Speaking...' : 'Listen'}</span>
                              </button>
                            </div>
                          </div>

                          {!isLast && (
                            <div className="flex flex-col items-center justify-center px-1 shrink-0">
                              <svg className="w-9 h-9 opacity-80" viewBox="0 0 36 36" fill="none">
                                <line
                                  x1="4"
                                  y1="18"
                                  x2="28"
                                  y2="18"
                                  stroke="var(--accent-color)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  className="vu-arrow-connector-line"
                                />
                                <polyline
                                  points="20,10 28,18 20,26"
                                  stroke="var(--accent-color)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                MODE C: 🔗 CAUSE & EFFECT SECTION STAGES
               ========================================================= */}
            {visMode === 'cause_effect' && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between pb-2 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                    🔗 Cause, Process & Effect Sections
                  </span>
                  <span className="text-[11px] opacity-70 font-semibold">
                    Categorized Conceptual Stages
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="vu-cause-effect-col">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b"
                         style={{ borderColor: 'var(--border-color)' }}>
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide">
                        1. Cause & Starting Sections
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.causeEffectStages.causes.map((sec) => (
                        <div
                          key={sec.id}
                          onClick={() => handleSelectSection(sec.sectionNumber - 1)}
                          className={`vu-node-box p-3.5 rounded-xl cursor-pointer ${
                            activeSectionIndex === sec.sectionNumber - 1 ? 'vu-node-focused' : ''
                          }`}>
                          <div className="text-[10px] font-bold opacity-60 uppercase">Section {sec.sectionNumber}</div>
                          <div className="font-bold text-sm mb-1">{sec.title}</div>
                          <p className="text-xs opacity-75 line-clamp-2">{sec.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="vu-cause-effect-col">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b"
                         style={{ borderColor: 'var(--border-color)' }}>
                      <Workflow className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide">
                        2. Process & Action Sections
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.causeEffectStages.processes.map((sec) => (
                        <div
                          key={sec.id}
                          onClick={() => handleSelectSection(sec.sectionNumber - 1)}
                          className={`vu-node-box p-3.5 rounded-xl cursor-pointer ${
                            activeSectionIndex === sec.sectionNumber - 1 ? 'vu-node-focused' : ''
                          }`}>
                          <div className="text-[10px] font-bold opacity-60 uppercase">Section {sec.sectionNumber}</div>
                          <div className="font-bold text-sm mb-1">{sec.title}</div>
                          <p className="text-xs opacity-75 line-clamp-2">{sec.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="vu-cause-effect-col">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b"
                         style={{ borderColor: 'var(--border-color)' }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide">
                        3. Effects & Result Sections
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.causeEffectStages.effects.map((sec) => (
                        <div
                          key={sec.id}
                          onClick={() => handleSelectSection(sec.sectionNumber - 1)}
                          className={`vu-node-box p-3.5 rounded-xl cursor-pointer ${
                            activeSectionIndex === sec.sectionNumber - 1 ? 'vu-node-focused' : ''
                          }`}>
                          <div className="text-[10px] font-bold opacity-60 uppercase">Section {sec.sectionNumber}</div>
                          <div className="font-bold text-sm mb-1">{sec.title}</div>
                          <p className="text-xs opacity-75 line-clamp-2">{sec.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                MODE D: 🔄 REPEATING CYCLE MODEL
               ========================================================= */}
            {visMode === 'cycle' && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between pb-2 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                    🔄 Circular Section Model
                  </span>
                  <span className="text-[11px] opacity-70 font-semibold">
                    Continuous Closed Cycle
                  </span>
                </div>

                <div className="overflow-x-auto pb-3">
                  <div className="flex items-center justify-start sm:justify-center min-w-max space-x-2 px-3">
                    {analysis.sections.map((sec, index) => {
                      const isLast = index === analysis.sections.length - 1;
                      const isFocused = activeSectionIndex === index;
                      const isDimmed = activeSectionIndex !== null && !isFocused;

                      return (
                        <React.Fragment key={sec.id}>
                          <div
                            onClick={() => handleSelectSection(index)}
                            className={`vu-node-box p-4 rounded-2xl cursor-pointer w-52 sm:w-60 shrink-0 ${
                              isFocused ? 'vu-node-focused' : ''
                            } ${isDimmed ? 'vu-node-dimmed' : ''}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="vu-section-badge px-2 py-0.5 rounded-full font-black text-xs">
                                Section {sec.sectionNumber}
                              </span>
                              <span className="text-[10px] font-bold uppercase opacity-60">
                                {sec.role}
                              </span>
                            </div>
                            <div className="font-extrabold text-sm line-clamp-1 mb-1">{sec.title}</div>
                            <p className="text-xs opacity-75 line-clamp-2">{sec.explanation}</p>
                          </div>

                          {!isLast && (
                            <ArrowRight className="w-6 h-6 text-emerald-600 shrink-0 opacity-70" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <div className="max-w-md mx-auto p-3 rounded-xl text-center text-xs font-bold vu-cycle-loop-banner flex items-center justify-center space-x-2">
                  <Repeat className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>
                    Repeating Cycle: Section {analysis.sections.length} loops back to Section 1 to sustain the process.
                  </span>
                </div>
              </div>
            )}

            {/* 5. SELECTED SECTION: SIMPLE EXPLANATION & VOICE CARD (in diagram modes) */}
            {visMode !== 'focus' && activeSection && (
              <div className="vu-explanation-box p-4 sm:p-5 rounded-2xl shadow-xs transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
                     style={{ borderColor: 'var(--border-color)' }}>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl border"
                         style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                      {renderNodeIcon(activeSection.icon)}
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                        Section {activeSection.sectionNumber} of {analysis.sections.length} · {activeSection.role}
                      </div>
                      <h4 className="text-base sm:text-lg font-black" style={{ color: 'var(--accent-color)' }}>
                        {activeSection.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {/* Focus on this section button */}
                    <button
                      type="button"
                      onClick={() => setVisMode('focus')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 shadow-xs hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--accent-color)',
                        color: 'var(--text-main)'
                      }}>
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      <span>🎯 Focus on This Section</span>
                    </button>

                    {/* Listen to Section Voice Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakSection(activeSection)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 border shadow-xs transition-all ${
                        isSpeakingActiveSection
                          ? 'bg-amber-400 text-amber-950 scale-105'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: isSpeakingActiveSection ? '#F59E0B' : 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: isSpeakingActiveSection ? '#000000' : 'var(--text-main)'
                      }}>
                      <Volume2 className={`w-4 h-4 ${isSpeakingActiveSection ? 'animate-bounce' : ''}`} />
                      <span>{isSpeakingActiveSection ? `Speaking Section ${activeSection.sectionNumber}...` : '🔊 Listen to Section'}</span>
                    </button>
                  </div>
                </div>

                {/* Section Explanation */}
                <div className="mt-3">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                    Section Explanation:
                  </div>
                  <p className="text-sm sm:text-base font-semibold leading-relaxed" style={{ color: 'var(--text-main)' }}>
                    "{activeSection.explanation}"
                  </p>

                  {/* Section Concept Tags */}
                  {activeSection.concepts && activeSection.concepts.length > 0 && (
                    <div className="mt-3 pt-2 border-t flex flex-wrap items-center gap-1.5"
                         style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-[11px] font-bold opacity-60 mr-1">Key Concepts:</span>
                      {activeSection.concepts.map((concept, cIdx) => (
                        <span key={cIdx} className="vu-concept-pill px-2.5 py-1 rounded-lg text-xs font-bold">
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. KEY POINTS AREA */}
            {analysis.keyPoints.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl border"
                   style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center space-x-2 mb-3">
                  <Key className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    Key Points from This Passage ({analysis.keyPoints.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysis.keyPoints.map((point, pIdx) => (
                    <div key={pIdx} className="vu-key-point-card p-3 rounded-xl flex items-start space-x-2.5">
                      <span className="text-sm shrink-0">🔑</span>
                      <p className="text-xs sm:text-sm font-semibold leading-snug">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SIMPLE SUMMARY: "💡 In Simple Words" */}
            <div className="vu-summary-box p-4 sm:p-5 rounded-2xl shadow-xs transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-xs sm:text-sm uppercase tracking-wide">
                    <Lightbulb className="w-4 h-4" />
                    <span>💡 In Simple Words</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold leading-relaxed opacity-95">
                    {analysis.simpleSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeakGeneral(analysis.simpleSummary, 'summary')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 border shadow-xs shrink-0 self-start sm:self-center transition-all ${
                    speakingKey === 'summary'
                      ? 'bg-amber-400 text-amber-950 scale-105'
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: speakingKey === 'summary' ? '#F59E0B' : 'var(--card-bg)',
                    borderColor: 'var(--flag-border)',
                    color: speakingKey === 'summary' ? '#000000' : 'var(--flag-text)'
                  }}>
                  <Volume2 className={`w-4 h-4 ${speakingKey === 'summary' ? 'animate-bounce' : ''}`} />
                  <span>{speakingKey === 'summary' ? 'Speaking Summary...' : '🔊 Listen to Summary'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
