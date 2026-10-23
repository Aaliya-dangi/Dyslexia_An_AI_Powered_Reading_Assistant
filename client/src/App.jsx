import React, { useRef, useState } from 'react';

async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Document processing failed.');
  }

  return data;
}

function App() {
  const [view, setView] = useState('text');
  const [inputText, setInputText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrMeta, setOcrMeta] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleTextSubmit = (event) => {
    event.preventDefault();
    const text = inputText.trim();

    if (!text) return;

    setDisplayedText(text);
    setErrorMessage('');
  };

  const handleClearText = () => {
    setInputText('');
    setDisplayedText('');
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    const allowed =
      file.type === 'application/pdf' ||
      file.type.startsWith('image/');

    if (!allowed) {
      setErrorMessage('Please select a PDF or image file.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('The selected file is larger than the 15 MB limit.');
      return;
    }

    setSelectedFile(file);
    setOcrText('');
    setOcrMeta(null);
    setErrorMessage('');
  };

  const handleFileInputChange = (event) => {
    handleFileSelection(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelection(event.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOcrText('');
    setOcrMeta(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage('');
    setOcrText('');
    setOcrMeta(null);

    try {
      const result = await uploadDocument(selectedFile);
      setOcrText(result.document.rawText);
      setOcrMeta(result.extractionMeta);
    } catch (error) {
      setErrorMessage(error.message || 'OCR processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const wordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).length
    : 0;

  const characterCount = inputText.length;

  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" onClick={() => setView('text')}>
          <span className="brand-logo">📖</span>
          <span>
            <strong className="brand-name">LexiRead</strong>
            <small className="brand-subtitle">Stage 1 — Text & OCR Input</small>
          </span>
        </button>

        <nav className="navigation">
          <button
            className={`nav-button ${view === 'text' ? 'active' : ''}`}
            onClick={() => setView('text')}
          >
            📝 Type / Paste
          </button>
          <button
            className={`nav-button ${view === 'upload' ? 'active' : ''}`}
            onClick={() => setView('upload')}
          >
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
        {view === 'text' && (
          <section className="workspace">
            <div className="intro">
              <span className="feature-label">✦ Accessible Text Input</span>
              <h1>
                Enter Text for
                <br />
                Accessible Reading
              </h1>
              <p>
                Type or paste text below. Stage 1 displays the submitted
                text without applying later reading-assistance features.
              </p>
            </div>

            <form className="card" onSubmit={handleTextSubmit}>
              <div className="card-header">
                <h2>Enter Your Text</h2>
                <p>Type or paste any text you want to preview.</p>
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
                  <span>{characterCount} characters</span>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleClearText}
                    disabled={!inputText}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={!inputText.trim()}
                  >
                    Display Text →
                  </button>
                </div>
              </div>
            </form>

            {displayedText && (
              <section className="card result-card">
                <div className="result-label">TEXT PREVIEW</div>
                <h2>Your Entered Text</h2>
                <div className="displayed-text">{displayedText}</div>
              </section>
            )}
          </section>
        )}

        {view === 'upload' && (
          <section className="workspace upload-workspace">
            <div className="intro">
              <span className="feature-label">↑ Document OCR</span>
              <h1>
                Upload a Document
              </h1>
              <p>
                Upload an image or PDF. The server extracts the text and
                returns the OCR result to the browser.
              </p>
            </div>

            <section className="card">
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                  onChange={handleFileInputChange}
                  hidden
                />

                <div className="upload-icon">↑</div>

                <h2>
                  {selectedFile
                    ? selectedFile.name
                    : 'Click to select or drag & drop a file'}
                </h2>

                <p>
                  PDF, PNG, JPG, JPEG, WebP, BMP, TIFF — up to 15 MB
                </p>
              </div>

              {selectedFile && (
                <div className="file-information">
                  <div className="file-details">
                    <div className="file-icon">
                      {selectedFile.type === 'application/pdf' ? 'PDF' : 'IMG'}
                    </div>
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <span>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleRemoveFile}
                    disabled={isProcessing}
                  >
                    Remove
                  </button>
                </div>
              )}

              <button
                type="button"
                className="primary-button ocr-button"
                onClick={handleOCR}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? 'Processing OCR…' : 'Extract Text with OCR →'}
              </button>
            </section>

            {ocrText && (
              <section className="card result-card">
                <div className="result-label">OCR RESULT</div>
                <h2>Extracted Text</h2>

                {ocrMeta && (
                  <div className="ocr-meta">
                    {ocrMeta.sourceType === 'image' &&
                      `OCR confidence: ${Number(ocrMeta.confidence || 0).toFixed(1)}%`}
                    {ocrMeta.sourceType === 'pdf' &&
                      `PDF text extraction: ${ocrMeta.totalPages || 1} page(s)`}
                  </div>
                )}

                <div className="displayed-text">{ocrText}</div>
              </section>
            )}

            <div className="stage-note">
              <strong>Stage 1</strong>
              <span>
                Implemented: text input, file selection, image OCR, PDF text
                extraction, OCR cleanup, result display, and basic error handling.
                Simplification, pronunciation, visualization, adaptive reading,
                and other later modules are intentionally outside this stage.
              </span>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <strong>Dyslexia-Friendly Reading Assistant</strong>
        <span>Final Year B.E. Project (CSE)</span>
      </footer>
    </div>
  );
}

export default App;