# LexiRead — Stage 1

This version is intentionally limited to the first working pipeline:

1. Type/paste text.
2. Display the entered text.
3. Select or drag/drop a document.
4. Upload the document to the backend.
5. OCR images with Tesseract.js.
6. Extract text from text-based PDFs with pdf-parse.
7. Normalize common OCR formatting artifacts.
8. Display the extracted text and basic extraction metadata.

Later modules are deliberately absent from this stage:
- simplification
- reading view
- pronunciation
- visualizations
- adaptive reading
- reading ruler
- settings/tools
- authentication
- MongoDB persistence
- speech
- telemetry

## Run

### Backend

```powershell
cd server
npm install
npm run dev
```

Backend runs on port 5000.

### Frontend

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

Frontend runs on Vite's port 5173.

The Vite proxy forwards `/api/*` to `http://localhost:5000`.

## OCR note

Tesseract.js performs OCR on image files. PDF handling in this stage uses pdf-parse, which extracts text that is already present in a PDF.

A scanned/image-only PDF needs a later PDF-rendering + OCR step; it is not honestly possible to call pdf-parse alone "OCR for scanned PDFs".
