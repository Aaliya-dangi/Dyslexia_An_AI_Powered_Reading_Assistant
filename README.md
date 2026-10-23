# LexiRead — Stage 2: OCR + Text Simplification

Stage 2 is built directly on the Stage 1 foundation.

## Included
- Type/paste text input
- Image OCR with Tesseract.js
- PDF text extraction with pdf-parse
- Text cleaning/normalization
- Rule-based lexical simplification
- Long/complex sentence splitting
- Light / Moderate / High simplification levels
- Readability analysis
- Re-simplification when the user changes the level
- Original/cleaned vs simplified result display

## Deliberately not included yet
- Reading ruler
- Text-to-speech / pronunciation
- Adaptive learning
- Visualization
- Understanding quiz
- Authentication
- Database persistence
- Other later-stage UI modules

## Dependencies
No new frontend dependencies were added for Stage 2.
The simplification engine uses the existing server-side JavaScript runtime and does not require an external AI API.

## Run
### Server
```powershell
cd server
npm install
npm run dev
```

### Client
```powershell
cd client
npm install
npm run dev
```

Open the Vite URL shown by the client.
