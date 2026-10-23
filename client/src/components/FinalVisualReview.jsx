import React, { useRef, useState, useMemo } from 'react';
import { Download, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import './FinalVisualReview.css';

/**
 * Extract a clean, natural 1-3 word educational label from a sentence
 */
function extractCleanStageLabel(sentence = '', index = 0) {
  let clean = sentence
    .replace(/^(furthermore|moreover|consequently|subsequently|in addition|therefore|simultaneously|notwithstanding|meanwhile|specifically|in the event that|similarly|archaeological investigations substantiate that|subsequent excavations have revealed that|it is known that|studies show that|as a result|due to this|essentially|firstly|first|secondly|second|thirdly|third|finally)[,\s]*/i, '')
    .trim();

  // Strip leading subordinate clauses
  if (/^(when|as|while|if|although|though|because|since|after|before)\b/i.test(clean)) {
    const parts = clean.split(/[,;]\s+/);
    if (parts.length > 1) {
      clean = parts.slice(1).join(', ').trim();
    }
  }

  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'of', 'at', 'by', 'into', 'which', 'that', 'this', 'these', 'those',
    'it', 'its', 'their', 'theirs', 'as', 'and', 'or', 'so', 'has', 'have', 'had',
    'with', 'from', 'for', 'to', 'in', 'on', 'than', 'more', 'most', 'very', 'also', 'can', 'could', 'may'
  ]);

  const words = clean
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.has(w.toLowerCase()));

  const chosen = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return chosen.length > 0 ? chosen.join(' ') : `Stage ${index + 1}`;
}

/**
 * Identify the physical process or mechanism described in the passage.
 * Maps to rich domain scenes when recognized, or universal educational journey for any other passage.
 */
function detectProcessScene(text = '', sentences = []) {
  const lower = text.toLowerCase();

  // 1. Photosynthesis: requires plant/leaf/cells AND light/sun OR water/roots OR carbon dioxide/oxygen
  const hasPlantSite = /\b(photosynthe\w*|chloroplast\w*|chlorophyll|thylakoid\w*|leaf|leaves|plants?)\b/i.test(lower);
  const hasSunlight = /\b(sunlight|solar|light\s+energy|photons?|photonic)\b/i.test(lower);
  const hasWaterOrGas = /\b(water|roots?|soil|carbon\s+dioxide|co2|oxygen|o2|glucose|sugar|atp)\b/i.test(lower);
  if (hasPlantSite && (hasSunlight || hasWaterOrGas)) {
    return 'biochemical_photosynthesis';
  }

  // 2. Water Cycle: requires evidence of evaporation, clouds/condensation, and rain/ocean/river
  const hasEvap = /\b(evaporat\w*|vapou?r|steam|sun|solar|warm\w*|heat)\b/i.test(lower);
  const hasCloud = /\b(condens\w*|clouds?|atmosphere|droplets?|cooling)\b/i.test(lower);
  const hasRainBasin = /\b(precipitat\w*|rain\w*|snow\w*|ocean\w*|rivers?|lakes?|basins?|runoff|cycle)\b/i.test(lower);
  if (hasEvap && hasCloud && hasRainBasin) {
    return 'environmental_water_cycle';
  }

  // 3. Cardiovascular Circulation: requires heart/cardiac AND blood vessels/circulation
  const hasCardiac = /\b(heart|cardiac|myocardi\w*|ventricle\w*|atrium|atria|valves?)\b/i.test(lower);
  const hasVascular = /\b(arter\w*|aorta|veins?|venous|capillar\w*|blood\s+pressure|blood\s+vessels?|circulation|plaque)\b/i.test(lower);
  if (hasCardiac && hasVascular) {
    return 'cardiovascular_circulation';
  }

  // 4. Urban Hydraulic Engineering: requires ancient civilization AND physical civil infrastructure
  const hasIndus = /\b(indus\s+valley|harappa\w*|mohenjo\w*|ancient\s+urban|bronze\s+age)\b/i.test(lower);
  const hasCivil = /\b(baked-brick|drainage|hydraulic|subterranean|sewers?|dockyard|lothal|weights?|great\s+bath|reservoirs?)\b/i.test(lower);
  if (hasIndus && hasCivil) {
    return 'urban_hydraulic_engineering';
  }

  // Universal Process & Educational Scene for ALL other passages
  return 'universal_illustrated_journey';
}

/**
 * Analyze text and determine supported elements for the static illustration
 */
function analyzeStaticIllustration(rawTitle, rawText, simplifiedText, paragraphs = []) {
  let fullText = (simplifiedText || rawText || '').trim();
  if (!fullText && paragraphs && paragraphs.length > 0) {
    fullText = paragraphs.map(p => p.simplifiedText || p.text || '').join('\n\n').trim();
  }

  const words = fullText.split(/\s+/).filter(Boolean);
  if (words.length < 12) {
    return { isInsufficient: true, reason: 'too_short', wordCount: words.length };
  }

  const sentences = fullText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length > 8);

  if (sentences.length < 2) {
    return { isInsufficient: true, reason: 'too_few_sentences', wordCount: words.length };
  }

  let cleanTitle = (rawTitle || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/^(Chapter|Section|Unit|Document|Passage)\s*\d*[:\-]?\s*/i, '')
    .trim();

  if (!cleanTitle || cleanTitle.toLowerCase() === 'untitled document' || cleanTitle.toLowerCase() === 'current document') {
    const firstS = sentences[0];
    const match = firstS.match(/^([A-Z][a-zA-Z\s]{2,35}?)(?:\s+(?:is|are|was|were|refers to|represents|demonstrates|operates|functions|takes place))/i);
    cleanTitle = match ? match[1].trim() : firstS.split(/\s+/).slice(0, 4).join(' ');
  }

  const sceneType = detectProcessScene(fullText, sentences);
  const lower = fullText.toLowerCase();

  // Extract dynamic grounded stages for universal process rendering
  const stageCount = Math.min(4, Math.max(3, sentences.length));
  const step = Math.max(1, Math.floor(sentences.length / stageCount));
  const stages = [];
  for (let i = 0; i < stageCount; i++) {
    const idx = Math.min(sentences.length - 1, i * step);
    stages.push({
      id: `stage-${i}`,
      index: i,
      label: extractCleanStageLabel(sentences[idx], i),
      sentence: sentences[idx]
    });
  }

  // Check which specific relationships are supported by the source text
  const supported = {
    // Photosynthesis supports
    sunlight: /\b(sun|sunlight|solar|light|photons?|photonic)\b/i.test(lower),
    water: /\b(water|roots?|soil|moisture|absorb\w*)\b/i.test(lower),
    co2: /\b(carbon\s+dioxide|co2|air|atmosphere|stomata)\b/i.test(lower),
    oxygen: /\b(oxygen|o2|byproduct|release)\b/i.test(lower),
    glucose: /\b(glucose|sugar|energy|atp|nadph|food|stored)\b/i.test(lower),

    // Water cycle supports
    evaporation: /\b(evaporat\w*|vapou?r|steam|heat|sun|warm)\b/i.test(lower),
    clouds: /\b(cloud|clouds|condens\w*|cooling|atmosphere)\b/i.test(lower),
    rain: /\b(rain|rainfall|precipitat\w*|snow)\b/i.test(lower),
    riverOcean: /\b(ocean|rivers?|lakes?|basin|runoff|groundwater|cycle)\b/i.test(lower),

    // Circulation supports
    heart: /\b(heart|cardiac|pump|ventricle|contraction)\b/i.test(lower),
    arteries: /\b(arter\w*|aorta|oxygenated|pressure)\b/i.test(lower),
    tissues: /\b(capillar\w*|tissue|cells|microcirculation)\b/i.test(lower),
    veins: /\b(veins?|venous|deoxygenated|return)\b/i.test(lower),
    plaque: /\b(plaque|narrow\w*|constriction|resistance|block\w*)\b/i.test(lower)
  };

  return {
    isInsufficient: false,
    sceneType,
    title: cleanTitle,
    stages,
    supported
  };
}

export default function FinalVisualReview({
  documentTitle = 'Current Document',
  rawText = '',
  simplifiedText = '',
  paragraphs = []
}) {
  const { settings } = useReadingSettings();
  const [downloaded, setDownloaded] = useState(false);
  const svgRef = useRef(null);

  const diagram = useMemo(() => {
    return analyzeStaticIllustration(documentTitle, rawText, simplifiedText, paragraphs);
  }, [documentTitle, rawText, simplifiedText, paragraphs]);

  // Theme-aware accessible colors
  const isDark = settings?.theme === 'slate' || settings?.theme === 'high-contrast-dark';
  const canvasBg = isDark ? '#111822' : '#FAF8F5';
  const borderColor = isDark ? '#2D3D4E' : '#E2D9C8';
  const textMain = isDark ? '#F1F5F9' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const accentColor = isDark ? '#38BDF8' : '#2D6A4F';
  const badgeBg = isDark ? '#1E293B' : '#FFFFFF';

  // Handle High-DPI PNG Download
  const handleDownloadPNG = () => {
    if (!svgRef.current || diagram.isInsufficient) return;

    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = canvasBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png');
          const safeTitle = (diagram.title || 'Educational_Illustration')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 40);

          const link = document.createElement('a');
          link.download = `${safeTitle}_Illustration.png`;
          link.href = pngUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2500);
        }
        URLObj.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    } catch (err) {
      console.error('PNG download error:', err);
    }
  };

  // Helper to render a static, clean label badge inside SVG
  const renderBadge = (x, y, w, label, color = accentColor) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height="28"
        rx="14"
        fill={badgeBg}
        stroke={color}
        strokeWidth="1.8"
      />
      <text
        x={x + w / 2}
        y={y + 18}
        textAnchor="middle"
        fill={textMain}
        fontSize="12"
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  );

  // Fallback state for abstract or brief passages
  if (diagram.isInsufficient) {
    return (
      <div
        className="final-visual-review-card mt-8 p-6 sm:p-8 rounded-2xl border shadow-xs"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)'
        }}
      >
        <div className="flex items-center space-x-2.5 mb-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
          >
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black">Visual Journey</h2>
            <p className="text-xs opacity-75">Illustrated Educational Picture</p>
          </div>
        </div>

        <div className="vj-fallback-box space-y-2.5">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Illustration Unavailable for Current Text</span>
          </div>
          {diagram.reason === 'too_short' ? (
            <p className="text-xs leading-relaxed opacity-85">
              The active passage contains only {diagram.wordCount || 0} words, which is too brief to construct an illustrated educational diagram.
            </p>
          ) : (
            <p className="text-xs leading-relaxed opacity-85">
              This passage discusses general ideas, literature, or abstract concepts without describing a physical process or step-by-step mechanism. To prevent misleading or invented relationships, no artificial illustration is shown.
            </p>
          )}
          <p className="text-[11px] opacity-75">
            <strong>Tip:</strong> Upload or paste a document describing a physical process (such as plant photosynthesis, the water cycle, or circulation) to generate an educational illustrated picture.
          </p>
        </div>
      </div>
    );
  }

  // Render the static educational picture based on the detected process
  const renderIllustration = () => {
    const supp = diagram.supported || {};

    // 1. PHOTOSYNTHESIS: A Green Plant in its Natural Environment
    if (diagram.sceneType === 'biochemical_photosynthesis') {
      return (
        <g>
          {/* Sky & Gentle Sun (Top Left) */}
          {supp.sunlight && (
            <g>
              {/* Radiant Sun */}
              <circle cx="140" cy="100" r="46" fill="#F59E0B" />
              <circle cx="140" cy="100" r="58" fill="#FDE68A" opacity="0.35" />
              {/* Golden Sun Beams shining directly onto the plant leaves */}
              <line x1="180" y1="130" x2="380" y2="240" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="8 6" />
              <line x1="160" y1="150" x2="350" y2="270" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="8 6" />
              <line x1="200" y1="110" x2="420" y2="210" stroke="#F59E0B" strokeWidth="3" strokeDasharray="8 6" />
              {/* Arrowhead onto leaf */}
              <polygon points="380,240 366,234 374,248" fill="#F59E0B" />
              {renderBadge(90, 32, 100, 'Sunlight', '#F59E0B')}
            </g>
          )}

          {/* Natural Ground & Underground Soil Cross-Section */}
          {/* Surface Grass Horizon */}
          <path
            d="M 40 410 Q 240 395 480 410 T 920 405 L 920 600 L 40 600 Z"
            fill={isDark ? '#1C1917' : '#EFE8DE'}
          />
          {/* Lush Green Grass Horizon Line */}
          <path
            d="M 40 410 Q 240 395 480 410 T 920 405"
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="5"
          />

          {/* Living Plant Underground Root System */}
          <g>
            {/* Primary Root */}
            <path
              d="M 480 410 Q 475 480 470 560"
              fill="none"
              stroke="#A16207"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Lateral Root Branches */}
            <path d="M 478 440 Q 420 470 370 490" fill="none" stroke="#CA8A04" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 475 470 Q 430 510 390 540" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 476 450 Q 530 480 580 500" fill="none" stroke="#CA8A04" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 473 490 Q 520 520 560 550" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 471 520 Q 440 550 420 570" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
            <path d="M 471 530 Q 500 560 520 575" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />

            {/* Water Absorption from Soil (Blue arrows entering roots & rising) */}
            {supp.water && (
              <g>
                {/* Water droplet accents in soil */}
                <circle cx="340" cy="490" r="7" fill="#0284C7" />
                <circle cx="610" cy="510" r="7" fill="#0284C7" />
                <circle cx="370" cy="550" r="6" fill="#0284C7" />
                <circle cx="580" cy="560" r="6" fill="#0284C7" />
                {/* Flow arrows up through roots and into stem */}
                <path d="M 360 490 Q 430 460 472 440" fill="none" stroke="#0284C7" strokeWidth="3" strokeDasharray="5 4" />
                <path d="M 470 550 L 474 415" fill="none" stroke="#0284C7" strokeWidth="3.5" strokeDasharray="6 4" />
                <polygon points="474,410 468,422 480,422" fill="#0284C7" />
                {renderBadge(290, 520, 140, 'Water from Soil', '#0284C7')}
              </g>
            )}
          </g>

          {/* Living Plant Sturdy Green Stem & Broad Leaves Above Ground */}
          <g>
            {/* Main Plant Stem */}
            <path
              d="M 476 410 Q 482 280 480 160"
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* Left Broad Leaf (Catching sunlight) */}
            <g>
              <path
                d="M 478 310 C 400 310 330 260 310 220 C 370 210 450 250 478 280 Z"
                fill="#40916C"
                stroke="#1B4332"
                strokeWidth="2.5"
              />
              {/* Leaf Center Vein */}
              <path d="M 478 300 Q 390 260 320 225" fill="none" stroke="#52B788" strokeWidth="2.5" />
            </g>

            {/* Right Broad Leaf */}
            <g>
              <path
                d="M 478 270 C 560 270 630 220 650 180 C 590 170 510 210 478 240 Z"
                fill="#40916C"
                stroke="#1B4332"
                strokeWidth="2.5"
              />
              {/* Leaf Center Vein */}
              <path d="M 478 260 Q 570 220 640 185" fill="none" stroke="#52B788" strokeWidth="2.5" />
            </g>

            {/* Smaller Upper Leaves */}
            <path
              d="M 480 200 C 430 190 390 160 380 140 C 420 135 460 160 480 185 Z"
              fill="#52B788"
              stroke="#1B4332"
              strokeWidth="2"
            />
            <path
              d="M 480 180 C 530 170 570 140 580 120 C 540 115 500 140 480 165 Z"
              fill="#52B788"
              stroke="#1B4332"
              strokeWidth="2"
            />

            {/* Top Flowering Blossom / Sunny Growth Shoot */}
            <circle cx="480" cy="145" r="16" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
            <circle cx="480" cy="145" r="9" fill="#FEF3C7" />
          </g>

          {/* Carbon Dioxide Entering Leaf (Right Side Flow) */}
          {supp.co2 && (
            <g>
              <path
                d="M 800 240 Q 720 250 630 240"
                fill="none"
                stroke="#64748B"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
              <polygon points="625,240 638,234 638,246" fill="#64748B" />
              {/* Floating CO2 particles */}
              <circle cx="730" cy="225" r="5" fill="#94A3B8" />
              <circle cx="680" cy="260" r="4" fill="#94A3B8" />
              {renderBadge(720, 195, 160, 'Carbon Dioxide In', '#64748B')}
            </g>
          )}

          {/* Fresh Oxygen Released into Air (Upper Right Flow) */}
          {supp.oxygen && (
            <g>
              <path
                d="M 540 160 Q 620 120 710 90"
                fill="none"
                stroke="#0284C7"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
              <polygon points="715,88 702,96 706,84" fill="#0284C7" />
              {/* Fresh O2 bubbles */}
              <circle cx="620" cy="115" r="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
              <circle cx="670" cy="95" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
              {renderBadge(690, 45, 140, 'Oxygen Released', '#0284C7')}
            </g>
          )}

          {/* Stored Plant Food / Glucose Energy (Flowing to grow plant) */}
          {supp.glucose && (
            <g>
              <circle cx="480" cy="220" r="11" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
              <circle cx="480" cy="220" r="5" fill="#F59E0B" />
              {renderBadge(410, 350, 140, 'Stored Energy', '#D97706')}
            </g>
          )}
        </g>
      );
    }

    // 2. WATER CYCLE: One Connected Panoramic Landscape
    if (diagram.sceneType === 'environmental_water_cycle') {
      return (
        <g>
          {/* Mountains & Foothills on the Left */}
          {/* Far Mountain Peak */}
          <polygon points="60,420 220,180 380,420" fill={isDark ? '#334155' : '#94A3B8'} />
          {/* Mountain Snowcap */}
          <polygon points="180,240 220,180 260,240 240,230 220,245 200,230" fill="#F8FAFC" />
          {/* Near Mountain Peak */}
          <polygon points="180,430 330,220 480,430" fill={isDark ? '#1E293B' : '#64748B'} />
          <polygon points="300,260 330,220 360,260 345,252 330,262 315,252" fill="#F8FAFC" />

          {/* Rolling Green Foothills Valley */}
          <path
            d="M 40 460 Q 240 410 440 450 T 700 470 L 700 600 L 40 600 Z"
            fill={isDark ? '#064E3B' : '#40916C'}
          />

          {/* Sparking Ocean / Lake Basin on the Right */}
          <path
            d="M 520 480 Q 720 460 920 480 L 920 600 L 520 600 Z"
            fill={isDark ? '#0C4A6E' : '#38BDF8'}
            opacity="0.85"
          />
          {/* Ocean Waves Ripples */}
          <path d="M 560 520 Q 640 510 720 520 T 880 520" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.6" />
          <path d="M 600 550 Q 680 540 760 550 T 910 550" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />

          {/* Natural River Winding from Mountain Foothills into Ocean */}
          <path
            d="M 330 430 Q 380 470 440 480 T 560 510 L 620 540"
            fill="none"
            stroke="#0284C7"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 330 430 Q 380 470 440 480 T 560 510 L 620 540"
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Golden Sun over Ocean (Top Right) */}
          {supp.evaporation && (
            <g>
              <circle cx="820" cy="110" r="44" fill="#F59E0B" />
              <circle cx="820" cy="110" r="58" fill="#FDE68A" opacity="0.35" />
              {/* Sun Rays radiating heat down to water */}
              <line x1="780" y1="150" x2="740" y2="240" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="820" y1="170" x2="820" y2="260" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 4" />
              {renderBadge(760, 36, 120, "Sun's Heat", '#F59E0B')}
            </g>
          )}

          {/* Evaporating Water Vapor rising from ocean */}
          {supp.evaporation && (
            <g>
              <path d="M 680 460 Q 700 370 660 280" fill="none" stroke="#38BDF8" strokeWidth="4" strokeDasharray="7 5" />
              <polygon points="660,275 654,288 666,288" fill="#38BDF8" />
              <path d="M 760 460 Q 780 360 740 260" fill="none" stroke="#38BDF8" strokeWidth="4" strokeDasharray="7 5" />
              <polygon points="740,255 734,268 746,268" fill="#38BDF8" />
              {renderBadge(640, 340, 150, 'Evaporating Water', '#0284C7')}
            </g>
          )}

          {/* Rain Clouds Gathering above mountains (Top Left / Center) */}
          {supp.clouds && (
            <g>
              <path
                d="M 220 150 A 35 35 0 0 1 280 135 A 45 45 0 0 1 360 150 A 35 35 0 0 1 390 195 A 30 30 0 0 1 360 235 L 210 235 A 35 35 0 0 1 185 185 A 35 35 0 0 1 220 150 Z"
                fill={isDark ? '#475569' : '#CBD5E1'}
                stroke="#64748B"
                strokeWidth="2.5"
              />
              {renderBadge(240, 75, 120, 'Rain Clouds', '#64748B')}
            </g>
          )}

          {/* Rainfall Precipitation Falling onto Mountain Slopes */}
          {supp.rain && (
            <g>
              <line x1="230" y1="245" x2="210" y2="330" stroke="#0284C7" strokeWidth="3" strokeDasharray="8 6" />
              <line x1="270" y1="245" x2="250" y2="340" stroke="#0284C7" strokeWidth="3.5" strokeDasharray="8 6" />
              <line x1="310" y1="245" x2="290" y2="335" stroke="#0284C7" strokeWidth="3" strokeDasharray="8 6" />
              <line x1="350" y1="245" x2="330" y2="345" stroke="#0284C7" strokeWidth="3.5" strokeDasharray="8 6" />
              {renderBadge(140, 270, 100, 'Rainfall', '#0284C7')}
            </g>
          )}

          {/* River Runoff back to Ocean */}
          {supp.riverOcean && (
            <g>
              <polygon points="560,505 548,495 558,490" fill="#0284C7" />
              {renderBadge(380, 520, 150, 'River Flow to Ocean', '#0284C7')}
            </g>
          )}
        </g>
      );
    }

    // 3. CARDIOVASCULAR CIRCULATION: Anatomical Heart & Circulatory Journey
    if (diagram.sceneType === 'cardiovascular_circulation') {
      return (
        <g>
          {/* Friendly Torso / Chest Background Silhouette */}
          <path
            d="M 300 120 C 340 70 620 70 660 120 C 720 200 750 380 720 540 L 240 540 C 210 380 240 200 300 120 Z"
            fill={isDark ? '#1E293B' : '#F1F5F9'}
            stroke="#CBD5E1"
            strokeWidth="3"
            opacity="0.6"
          />

          {/* Soft Lungs on Either Side */}
          <path d="M 330 190 C 310 240 310 330 360 360 C 380 340 380 230 360 190 Z" fill="#FDA4AF" opacity="0.5" stroke="#F43F5E" strokeWidth="2" />
          <path d="M 630 190 C 650 240 650 330 600 360 C 580 340 580 230 600 190 Z" fill="#FDA4AF" opacity="0.5" stroke="#F43F5E" strokeWidth="2" />

          {/* Muscular Heart Pump in Center */}
          <g>
            <path
              d="M 480 180 C 440 120 370 130 370 210 C 370 290 480 370 480 370 C 480 370 590 290 590 210 C 590 130 520 120 480 180 Z"
              fill={isDark ? '#4C0519' : '#FFE4E6'}
              stroke="#E11D48"
              strokeWidth="4"
            />
            {/* Directional Valves inside heart */}
            <line x1="465" y1="230" x2="480" y2="255" stroke="#E11D48" strokeWidth="3.5" />
            <line x1="495" y1="230" x2="480" y2="255" stroke="#E11D48" strokeWidth="3.5" />
            {renderBadge(420, 110, 120, 'Heart Pump', '#E11D48')}
          </g>

          {/* Red Oxygenated Arterial Flow Down to Tissues */}
          <g>
            <path
              d="M 460 370 C 460 450 340 430 340 490"
              fill="none"
              stroke="#DC2626"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Downward flow arrowhead */}
            <polygon points="334,485 346,485 340,500" fill="#DC2626" />
            {renderBadge(220, 420, 150, 'Oxygen-Rich Blood', '#DC2626')}
          </g>

          {/* Capillary Mesh Bed (Oxygen delivery to body cells) */}
          <g>
            <rect x="340" y="490" width="280" height="40" rx="12" fill="#F3E8FF" stroke="#9333EA" strokeWidth="2.5" />
            <text x="480" y="515" textAnchor="middle" fill="#7E22CE" fontSize="12" fontWeight="bold">
              Body Cells & Capillary Exchange
            </text>
          </g>

          {/* Blue Deoxygenated Venous Return Loop Back to Heart */}
          <g>
            <path
              d="M 620 490 C 620 430 500 450 500 370"
              fill="none"
              stroke="#2563EB"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Upward return arrowhead */}
            <polygon points="494,380 506,380 500,365" fill="#2563EB" />
            {renderBadge(590, 420, 130, 'Venous Return', '#2563EB')}
          </g>

          {/* Inset Plaque Cutaway (If supported by passage) */}
          {supp.plaque && (
            <g>
              <rect x="740" y="240" width="160" height="90" rx="10" fill={canvasBg} stroke="#E11D48" strokeWidth="2.5" />
              <path d="M 750 270 Q 820 285 890 270 L 890 300 Q 820 285 750 300 Z" fill="#DC2626" />
              {/* Plaque buildup deposits */}
              <path d="M 770 252 Q 820 275 870 252 Z" fill="#F59E0B" />
              <path d="M 770 318 Q 820 295 870 318 Z" fill="#F59E0B" />
              <text x="820" y="290" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">HIGH RESISTANCE</text>
              {renderBadge(750, 340, 140, 'Vessel Plaque', '#D97706')}
            </g>
          )}
        </g>
      );
    }

    // 4. ANCIENT URBAN ENGINEERING (Indus Valley / Harappan Grid & Hydraulic Infrastructure)
    if (diagram.sceneType === 'urban_hydraulic_engineering') {
      return (
        <g>
          {/* Planned Terracotta Baked-Brick Houses */}
          <polygon points="260,180 380,120 500,180 380,240" fill={isDark ? '#78350F' : '#FED7AA'} stroke="#EA580C" strokeWidth="2.5" />
          <polygon points="260,180 380,240 380,310 260,250" fill={isDark ? '#9A3412' : '#FDBA74'} stroke="#EA580C" strokeWidth="2.5" />
          <polygon points="380,240 500,180 500,250 380,310" fill={isDark ? '#C2410C' : '#FB923C'} stroke="#EA580C" strokeWidth="2.5" />
          {renderBadge(240, 75, 170, 'Planned Brick Houses', '#EA580C')}

          {/* Subterranean Covered Brick Drainage Cutaway */}
          <rect x="180" y="340" width="600" height="75" rx="8" fill={isDark ? '#1C1917' : '#F5F5F4'} stroke="#78716C" strokeWidth="3" />
          <rect x="200" y="360" width="560" height="35" rx="6" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
          <path d="M 220 377 L 740 377" stroke="#BAE6FD" strokeWidth="4" strokeDasharray="16 10" />
          <polygon points="730,371 745,377 730,383" fill="#BAE6FD" />
          {renderBadge(360, 425, 170, 'Covered Street Drains', '#0284C7')}

          {/* Standardized Chert Weights & Maritime Trade Dock */}
          <polygon points="140,510 170,490 200,510 170,530" fill="#64748B" stroke="#334155" strokeWidth="2" />
          <path d="M 240 520 L 360 520 L 340 550 L 260 550 Z" fill="#92400E" stroke="#78350F" strokeWidth="3" />
          <line x1="300" y1="520" x2="300" y2="470" stroke="#78350F" strokeWidth="3" />
          <polygon points="300,475 350,495 300,515" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          {renderBadge(140, 560, 160, 'River Trade & Weights', '#92400E')}

          {/* Great Bath Public Community Reservoir */}
          <rect x="620" y="470" width="220" height="75" rx="8" fill={isDark ? '#0C4A6E' : '#E0F2FE'} stroke="#0284C7" strokeWidth="3" />
          <rect x="640" y="485" width="180" height="45" rx="4" fill="#38BDF8" opacity="0.6" />
          <text x="730" y="512" textAnchor="middle" fill="#0369A1" fontSize="11" fontWeight="bold">Great Bath Clean Water</text>
          {renderBadge(650, 560, 160, 'Great Bath Reservoir', '#0284C7')}
        </g>
      );
    }

    // 5. UNIVERSAL ILLUSTRATED EDUCATIONAL SCENE (Grounded in ANY passage)
    const st = diagram.stages || [];
    const hasFour = st.length >= 4;

    if (hasFour) {
      const s0 = st[0]?.label || 'Initial Inception';
      const s1 = st[1]?.label || 'Active Development';
      const s2 = st[2]?.label || 'Core Mechanism';
      const s3 = st[3]?.label || 'System Outcome';

      const w0 = Math.max(160, Math.min(260, s0.length * 8.5 + 24));
      const w1 = Math.max(160, Math.min(260, s1.length * 8.5 + 24));
      const w2 = Math.max(160, Math.min(260, s2.length * 8.5 + 24));
      const w3 = Math.max(160, Math.min(260, s3.length * 8.5 + 24));

      return (
        <g>
          {/* Ground Horizon Atmosphere */}
          <path
            d="M 40 480 Q 240 460 480 475 T 920 470 L 920 600 L 40 600 Z"
            fill={isDark ? '#064E3B' : '#ECFDF5'}
            opacity="0.5"
          />

          {/* Tier 0: Starting Origin */}
          <g>
            <circle cx="480" cy="85" r="38" fill={isDark ? '#1E293B' : '#E0F2FE'} stroke="#0284C7" strokeWidth="3.5" />
            <circle cx="480" cy="85" r="24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5 4" />
            {renderBadge(480 - w0 / 2, 130, w0, s0, '#0284C7')}
          </g>

          {/* Flow Conduit 0 -> 1 */}
          <path d="M 480 165 L 480 205" stroke={accentColor} strokeWidth="3.5" />
          <polygon points="474,198 486,198 480,210" fill={accentColor} />

          {/* Tier 1: Development Chamber */}
          <g>
            <rect x="380" y="215" width="200" height="55" rx="14" fill={isDark ? '#312E81' : '#EDE9FE'} stroke="#6366F1" strokeWidth="3" />
            <circle cx="480" cy="242" r="16" fill="#818CF8" />
            {renderBadge(480 - w1 / 2, 280, w1, s1, '#6366F1')}
          </g>

          {/* Flow Conduit 1 -> 2 */}
          <path d="M 480 315 L 480 355" stroke={accentColor} strokeWidth="3.5" />
          <polygon points="474,348 486,348 480,360" fill={accentColor} />

          {/* Tier 2: Core Mechanism Chamber */}
          <g>
            <rect x="380" y="365" width="200" height="55" rx="14" fill={isDark ? '#701A75' : '#FAE8FF'} stroke="#D946EF" strokeWidth="3" />
            <circle cx="480" cy="392" r="16" fill="#E879F9" />
            {renderBadge(480 - w2 / 2, 430, w2, s2, '#D946EF')}
          </g>

          {/* Flow Conduit 2 -> 3 */}
          <path d="M 480 465 L 480 500" stroke={accentColor} strokeWidth="3.5" />
          <polygon points="474,493 486,493 480,505" fill={accentColor} />

          {/* Tier 3: Concluding Outcome Reservoir */}
          <g>
            <path d="M 340 510 L 620 510 L 580 565 L 380 565 Z" fill={isDark ? '#064E3B' : '#D1FAE5'} stroke="#10B981" strokeWidth="3.5" />
            {renderBadge(480 - w3 / 2, 575, w3, s3, '#10B981')}
          </g>
        </g>
      );
    }

    // 3-Tier Layout for 2-3 Stage Passages
    const s0 = st[0]?.label || 'Initial Inception';
    const s1 = st[1]?.label || 'Core Process';
    const s2 = st[2]?.label || 'Final Outcome';

    const w0 = Math.max(160, Math.min(260, s0.length * 8.5 + 24));
    const w1 = Math.max(160, Math.min(260, s1.length * 8.5 + 24));
    const w2 = Math.max(160, Math.min(260, s2.length * 8.5 + 24));

    return (
      <g>
        {/* Soft Landscape Horizon */}
        <path
          d="M 40 450 Q 240 420 480 440 T 920 435 L 920 600 L 40 600 Z"
          fill={isDark ? '#064E3B' : '#ECFDF5'}
          opacity="0.4"
        />

        {/* Tier 1: Inception Origin */}
        <g>
          <circle cx="480" cy="115" r="44" fill={isDark ? '#1E293B' : '#E0F2FE'} stroke="#0284C7" strokeWidth="3.5" />
          <circle cx="480" cy="115" r="28" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5 4" />
          {renderBadge(480 - w0 / 2, 40, w0, s0, '#0284C7')}
        </g>

        {/* Downward Flow Conduit */}
        <path d="M 480 165 L 480 265" stroke={accentColor} strokeWidth="4" />
        <polygon points="473,255 487,255 480,270" fill={accentColor} />

        {/* Tier 2: Transformation Mechanism */}
        <g>
          <rect x="370" y="275" width="220" height="85" rx="16" fill={isDark ? '#312E81' : '#EDE9FE'} stroke="#6366F1" strokeWidth="3.5" />
          <circle cx="480" cy="317" r="20" fill="#818CF8" />
          {renderBadge(480 - w1 / 2, 375, w1, s1, '#6366F1')}
        </g>

        {/* Downward Flow Conduit */}
        <path d="M 480 410 L 480 480" stroke={accentColor} strokeWidth="4" />
        <polygon points="473,470 487,470 480,485" fill={accentColor} />

        {/* Tier 3: Final Outcome Reservoir */}
        <g>
          <path d="M 330 490 L 630 490 L 590 560 L 370 560 Z" fill={isDark ? '#064E3B' : '#D1FAE5'} stroke="#10B981" strokeWidth="3.5" />
          {renderBadge(480 - w2 / 2, 575, w2, s2, '#10B981')}
        </g>
      </g>
    );
  };

  return (
    <div
      className="final-visual-review-card mt-8 p-5 sm:p-7 rounded-2xl border shadow-xs"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      }}
    >
      {/* Header Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
          >
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black">Visual Journey</h2>
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--flag-bg)',
                  color: 'var(--flag-text)',
                  borderColor: 'var(--flag-border)'
                }}
              >
                Static Educational Picture
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              One complete visual illustration explaining the process described in your document.
            </p>
          </div>
        </div>

        {/* High-DPI PNG Download */}
        <button
          type="button"
          onClick={handleDownloadPNG}
          className="vj-btn"
          title="Download the static educational picture as a PNG file"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved as PNG!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Picture</span>
            </>
          )}
        </button>
      </div>

      {/* ONE Complete Static Picture Frame */}
      <div className="vj-picture-frame">
        <svg
          ref={svgRef}
          viewBox="0 0 960 620"
          className="vj-svg-picture"
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          {/* Backdrop Canvas */}
          <rect width="960" height="620" fill={canvasBg} rx="12" />
          <rect x="6" y="6" width="948" height="608" fill="none" stroke={borderColor} strokeWidth="1.5" rx="10" />

          {/* Picture Graphic Header */}
          <text x="36" y="32" fill={accentColor} fontSize="11" fontWeight="bold" letterSpacing="0.08em">
            EDUCATIONAL ILLUSTRATION
          </text>
          <text x="36" y="52" fill={textMain} fontSize="17" fontWeight="black">
            {diagram.title}
          </text>

          {/* The Entire Static Illustration */}
          {renderIllustration()}
        </svg>
      </div>
    </div>
  );
}
