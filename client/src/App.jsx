import React, { useRef, useState } from 'react';
import {
  submitTextDocument,
  uploadDocument,
  changeSimplificationLevel
} from './api';

const LEVELS = [
  { id: 'light', label: 'Light', description: 'Small vocabulary changes' },
  { id: 'moderate', label: 'Moderate', description: 'Simpler words and shorter sentences' },
  { id: 'high', label: 'High', description: 'Strong simplification and shorter chunks' }
];

function App() {
  const [view, setView] = useState('text');
  const [inputText, setInputText] = useState('');
  const [document, setDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [level, setLevel] = useState('moderate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleTextSubmit = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const result = await submitTextDocument(inputText, level);
      setDocument(result.document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    const allowed = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!allowed) {
      setErrorMessage('Please select a PDF or image file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('The selected file is larger than the 15 MB limit.');
      return;
    }
    setSelectedFile(file);
    setDocument(null);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const result = await uploadDocument(selectedFile, level);
      setDocument(result.document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLevelChange = async (newLevel) => {
    setLevel(newLevel);
    if (!document?.rawText) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const result = await changeSimplificationLevel(document.rawText, newLevel);
      setDocument((current) => ({ ...current, ...result.document }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setDocument(null);
    setErrorMessage('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDocument(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" onClick={() => setView('text')}>
          <span className="brand-logo">📖</span>
          <span>
            <strong className="brand-name">LexiRead</strong>
            <small className="brand-subtitle">Stage 2 — Simplification</small>
          </span>
        </button>

        <nav className="navigation">
          <button className={`nav-button ${view === 'text' ? 'active' : ''}`} onClick={() => setView('text')}>
            📝 Type / Paste
          </button>
          <button className={`nav-button ${view === 'upload' ? 'active' : ''}`} onClick={() => setView('upload')}>
            ⬆ Upload & OCR
          </button>
        </nav>
      </header>

      {errorMessage && (
        <div className="error-banner">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')}>Dismiss</button>
        </div>
      )}

      <main className="main-content">
        <section className="workspace">
          <div className="intro">
            <span className="feature-label">✦ Text Simplification</span>
            <h1>Make Complex Text<br />Easier to Read</h1>
            <p>
              Enter text or upload a document. LexiRead extracts the text,
              cleans it, and applies rule-based simplification at the selected level.
            </p>
          </div>

          <div className="level-card">
            <div>
              <strong>Simplification Level</strong>
              <p>Change how strongly the text is simplified.</p>
            </div>
            <div className="level-buttons">
              {LEVELS.map((item) => (
                <button
                  key={item.id}
                  className={level === item.id ? 'level-button active' : 'level-button'}
                  onClick={() => handleLevelChange(item.id)}
                  disabled={isProcessing}
                  title={item.description}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {view === 'text' && (
            <form className="card" onSubmit={handleTextSubmit}>
              <div className="card-header">
                <h2>Enter Your Text</h2>
                <p>Type or paste any text you want to simplify.</p>
              </div>
              <textarea
                className="text-input"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="Type or paste your text here..."
              />
              <div className="input-footer">
                <div className="text-statistics">
                  <span>{wordCount} words</span>
                  <span>{inputText.length} characters</span>
                </div>
                <div className="button-group">
                  <button type="button" className="secondary-button" onClick={handleClear} disabled={!inputText && !document}>
                    Clear
                  </button>
                  <button type="submit" className="primary-button" disabled={!inputText.trim() || isProcessing}>
                    {isProcessing ? 'Simplifying…' : 'Simplify Text →'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {view === 'upload' && (
            <section className="card">
              <div className="card-header">
                <h2>Upload a Document</h2>
                <p>OCR/extract the text first, then simplify the extracted content.</p>
              </div>
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => { event.preventDefault(); setDragOver(false); handleFileSelection(event.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                  onChange={(event) => handleFileSelection(event.target.files?.[0])}
                  hidden
                />
                <div className="upload-icon">↑</div>
                <h2>{selectedFile ? selectedFile.name : 'Click to select or drag & drop a file'}</h2>
                <p>PDF, PNG, JPG, JPEG, WebP, BMP, TIFF — up to 15 MB</p>
              </div>

              {selectedFile && (
                <div className="file-information">
                  <div className="file-details">
                    <div className="file-icon">{selectedFile.type === 'application/pdf' ? 'PDF' : 'IMG'}</div>
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button type="button" className="secondary-button" onClick={handleRemoveFile} disabled={isProcessing}>Remove</button>
                </div>
              )}

              <div className="button-group upload-actions">
                <button type="button" className="primary-button" onClick={handleUpload} disabled={!selectedFile || isProcessing}>
                  {isProcessing ? 'Extracting & Simplifying…' : 'Extract & Simplify →'}
                </button>
              </div>
            </section>
          )}

          {document && (
            <section className="card result-card">
              <div className="result-label">SIMPLIFIED RESULT</div>
              <div className="result-heading-row">
                <div>
                  <h2>{document.title}</h2>
                  <p className="result-meta">Level: {document.simplificationLevel}</p>
                </div>
              </div>

              <div className="comparison-grid">
                <div>
                  <h3>Original / Cleaned Text</h3>
                  <div className="displayed-text original-text">{document.rawText}</div>
                </div>
                <div>
                  <h3>Simplified Text</h3>
                  <div className="displayed-text">{document.simplifiedText}</div>
                </div>
              </div>

              {document.readabilityScore && (
                <div className="stats-row">
                  <span>Original grade: {document.readabilityScore.originalGrade}</span>
                  <span>New grade: {document.readabilityScore.fleschKincaidGrade}</span>
                  <span>Grade drop: {document.readabilityScore.gradeDrop}</span>
                  <span>Reading ease: {document.readabilityScore.fleschReadingEase}</span>
                </div>
              )}
            </section>
          )}

          <div className="stage-note">
            <strong>Stage 2</strong>
            <span>
              Stage 1 text input, file upload, OCR/PDF extraction and text cleaning are retained.
              This stage adds rule-based lexical simplification, sentence splitting, readability analysis,
              and live re-simplification when Light, Moderate or High is selected.
            </span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <strong>Dyslexia-Friendly Reading Assistant</strong>
        <span>Final Year B.E. Project (CSE)</span>
      </footer>
    </div>
  );
}

export default App;
