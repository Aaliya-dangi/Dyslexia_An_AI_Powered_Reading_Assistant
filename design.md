# System Design Document
## An Intelligent AI-Powered Dyslexia-Friendly Reading Assistant with Real-Time Adaptive Support

---

## 1. Architecture Overview

A standard 3-tier web architecture, matching the report's stack (React/Tailwind frontend,
Node/Express backend, MongoDB/Firebase persistence), with AI/NLP/OCR/Speech capabilities
either called as external APIs or run as internal services.

```
┌─────────────────────────────┐
│         CLIENT (SPA)        │
│   React.js + Tailwind CSS   │
│  Reading View · Uploader ·  │
│  Settings · Dashboard       │
└───────────────┬─────────────┘
                │ REST / WebSocket
┌───────────────▼─────────────┐
│      BACKEND (Node/Express) │
│  ┌────────────────────────┐ │
│  │ Auth & User Service     │ │
│  ├────────────────────────┤ │
│  │ Ingestion Service        │→│  OCR Engine (image/PDF/scan → text)
│  ├────────────────────────┤ │
│  │ Simplification Service   │→│  NLP Service (vocab + sentence simplification)
│  ├────────────────────────┤ │
│  │ Speech Service            │→│  TTS API / STT API
│  ├────────────────────────┤ │
│  │ Adaptive Engine           │  (rule-based → ML-based reading-behavior analyzer)
│  ├────────────────────────┤ │
│  │ Visualization Service     │→│  AI Visualization module (text → diagram/flowchart)
│  └────────────────────────┘ │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│   DATABASE (MongoDB/Firebase)│
│  Users · Documents · Reading  │
│  Sessions · Progress ·        │
│  Preferences                  │
└───────────────────────────────┘
```

## 2. Module Design

### 2.1 Ingestion & OCR Module
- **Input:** typed/pasted text, image (jpg/png), PDF, scanned document.
- **Process:** if not plain text, route to OCR engine → extract raw text → clean (strip noise,
  fix line breaks, de-hyphenate) → produce a normalized text object with paragraph/sentence
  boundaries preserved.
- **Output:** `{ documentId, rawText, paragraphs: [...], sourceType }`

### 2.2 NLP Simplification Module
- **Input:** normalized text from ingestion.
- **Process:**
  - Sentence segmentation.
  - Complexity scoring per sentence (e.g., length, syllable count, readability index).
  - Simplification pass: replace low-frequency/complex words with simpler synonyms (lexical
    simplification), split long/compound sentences (syntactic simplification), while preserving
    original meaning.
  - Tag "difficult words" per sentence for later highlighting/glossary use.
- **Output:** `{ simplifiedText, difficultWords: [...], readabilityScore }`

### 2.3 Dyslexia-Friendly Rendering (Frontend)
- Configurable typography: font family (dyslexia-friendly options), size, line spacing, letter
  spacing, paragraph width, background/text color theme (e.g., cream background, reduced
  contrast/glare options).
- Word/line highlighting component driven by TTS word-boundary events (or, if unsupported by
  the chosen TTS engine, an estimated timing map based on word length/speech rate).
- Inline "tap a word to hear/define it" interaction for flagged difficult words.

### 2.4 Speech Module (TTS + STT)
- **TTS:** send simplified text (per paragraph, to keep sync tight) to a TTS API; request
  word-boundary/timing metadata if available; stream audio to the client; adjustable rate/pitch.
- **STT (pronunciation support):** capture user's spoken attempt at a word/sentence via mic,
  send to a speech-recognition API, compare against target text, return simple feedback
  (matched / mismatched words) — not used for grading, only support.

### 2.5 Real-Time Adaptive Engine
This is the "intelligence" layer distinguishing this project from a plain OCR+TTS tool.

- **Signals captured per reading session:**
  - Reading speed (words/min, from highlight progression vs. wall-clock time, or from
    manual "next" pacing if self-paced).
  - Pause locations and durations (where the user stops/rewinds).
  - Words re-read/backtracked to.
  - Words the user requested audio/definition for (explicit difficulty signal).
  - STT mismatches (pronunciation struggle signal).
- **Adaptation logic (MVP — rule-based heuristics):**
  - If pause/backtrack rate on a paragraph exceeds a threshold → auto-increase simplification
    level for subsequent paragraphs, and/or slow TTS rate.
  - If a word is repeatedly flagged → add to the user's personal "difficult words" list, surface
    it with extra highlighting/glossary hints across future documents.
  - If reading speed and accuracy are consistently high → gradually reduce simplification
    (avoid over-simplifying and under-challenging the learner).
- **Stretch goal:** replace/augment the rule-based layer with a lightweight ML model trained on
  accumulated session signals per user to predict an appropriate simplification/pacing level.
- **Output:** an updated `readingProfile` per user, applied to future content.

### 2.6 AI Visualization Module
- **Input:** a paragraph or section of (simplified) text.
- **Process:** extract key entities/relationships/sequence cues (e.g., "first/then/because/leads
  to") and generate a simple structured representation — a flowchart for sequential/process text,
  a mind map for concept relationships, or a bulleted visual summary for descriptive text.
- **Output:** a diagram spec (nodes/edges or outline) rendered client-side (e.g., as SVG).

### 2.7 User & Progress Module
- Auth (email/password or provider), profile with reading preferences (font, spacing, theme,
  default TTS rate).
- Per-document reading sessions stored with the adaptive signals above.
- Progress view: readability trend over time, most-frequent difficult words, sessions completed.

## 3. Data Model (indicative)

**User**
```
{
  _id, name, email, passwordHash,
  preferences: { font, fontSize, lineSpacing, theme, ttsRate },
  readingProfile: { simplificationLevel, difficultWords: [word...] },
  createdAt
}
```

**Document**
```
{
  _id, userId, sourceType, rawText, simplifiedText,
  paragraphs: [ { text, simplifiedText, difficultWords: [...] } ],
  readabilityScore, createdAt
}
```

**ReadingSession**
```
{
  _id, userId, documentId,
  startedAt, endedAt,
  events: [ { type: "pause"|"backtrack"|"wordFlag"|"sttMismatch", position, timestamp } ],
  wpm, completionPercent
}
```

## 4. API Design (indicative REST endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` / `/api/auth/login` | Auth |
| POST | `/api/documents/upload` | Upload image/PDF/scan → triggers OCR |
| POST | `/api/documents/text` | Submit pasted/typed text directly |
| GET | `/api/documents/:id` | Get original + simplified text, paragraphs, difficult words |
| POST | `/api/documents/:id/simplify` | Re-run simplification at a given level |
| POST | `/api/speech/tts` | Get TTS audio + word-timing map for a text block |
| POST | `/api/speech/stt` | Submit audio, get transcription/match result |
| POST | `/api/sessions/:documentId/event` | Log a reading-behavior event (pause/backtrack/flag) |
| GET | `/api/users/me/progress` | Reading history & progress summary |
| POST | `/api/documents/:id/visualize` | Generate diagram/flowchart for a section |

## 5. UX Notes (dyslexia-specific)

- Avoid pure white backgrounds and high-contrast black-on-white by default; offer cream/soft
  tones.
- Left-aligned text, generous line height (≥1.5), moderate line length (not full-width on large
  screens).
- Avoid italics/all-caps for body text.
- Keep controls (font/spacing/speed) always one click away, not buried in nested settings.
- Word highlighting should be a soft box/underline, not a jarring color flash.

## 6. Deployment (suggested, cost-effective)

- Frontend: static hosting (e.g., Vercel/Netlify).
- Backend: small Node server (e.g., Render/Railway) or Firebase Functions if going full-Firebase.
- Database: MongoDB Atlas free tier or Firebase Firestore.
- OCR/NLP/TTS/STT: start with free-tier or open-source options to keep the project cost-effective,
  as emphasized in the report; swap in paid APIs only where quality demands it.
