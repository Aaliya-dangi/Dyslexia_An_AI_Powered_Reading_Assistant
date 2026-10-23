# Initial Prompt — Use this to start building the project

Paste this into Claude Code (or a similar coding assistant), with `PRD.md` and `design.md`
placed in the project root so the assistant can read them first.

---

I'm building my final-year B.E. project: **"An Intelligent AI-Powered Dyslexia-Friendly
Reading Assistant with Real-Time Adaptive Support."**

Read `PRD.md` and `design.md` in this repo first — they define the full scope, features,
architecture, data model, and API design. Build to that spec.

**Stack (fixed by the project report — please stick to these unless there's a strong reason
not to):**
- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB (use Mongoose)
- OCR: any solid free/open-source OCR (e.g., Tesseract.js) for images/PDFs/scans
- NLP simplification: start with a rule-based/heuristic simplifier (readability scoring +
  synonym substitution + sentence splitting) — no need for a heavy custom ML model yet
- TTS/STT: use the Web Speech API for the MVP (free, browser-native, gives word-boundary
  events for highlighting) — swap to a hosted API later only if quality requires it
- Auth: simple email/password with JWT

**What I want you to do first (Phase 1 of the milestones in PRD.md):**

1. Scaffold the project: a `client/` (React + Tailwind) and `server/` (Express) app, with a
   basic shared structure for the API defined in `design.md`.
2. Implement the core pipeline end-to-end for plain typed/pasted text first (skip OCR for the
   very first pass):
   - Text input screen.
   - Backend endpoint that runs the text through the (rule-based) simplification module and
     returns simplified text + flagged difficult words.
   - A dyslexia-friendly reading view on the frontend: adjustable font/size/spacing/theme,
     and the simplified text rendered with difficult words visually flagged.
3. Then wire up image/PDF upload → OCR → same pipeline.
4. Keep the adaptive-engine and visualization modules as clearly separated services/functions
   (even if stubbed at first) so they're easy to build out in later phases without a rewrite.

Ask me before making any architecture decision that isn't already specified in `design.md`.
Work in small, testable increments — after each phase, tell me how to run and verify it
before moving on.