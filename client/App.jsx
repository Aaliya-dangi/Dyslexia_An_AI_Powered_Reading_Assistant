
import React, { useRef, useState } from 'react';

function App() {
  const [view, setView] = useState('text');

  const [inputText, setInputText] = useState('');
  const [displayedText, setDisplayedText] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================
  // TEXT INPUT
  // =========================================================

  const handleTextSubmit = (event) => {
    event.preventDefault();

    const text = inputText.trim();

    if (!text) {
      return;
    }

    setDisplayedText(text);
  };

  const handleClearText = () => {
    setInputText('');
    setDisplayedText('');
  };

  // =========================================================
  // FILE INPUT
  // =========================================================

  const handleFileSelection = (file) => {
    if (!file) {
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];

    handleFileSelection(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragOver(false);

    const file = event.dataTransfer.files?.[0];

    handleFileSelection(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // TEXT STATISTICS
  // =========================================================

  const wordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).length
    : 0;

  const characterCount = inputText.length;

  // =========================================================
  // APPLICATION
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="navbar">

        <div
          className="brand"
          onClick={() => setView('text')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              setView('text');
            }
          }}
        >
          <div className="brand-logo">
            📖
          </div>

          <div>
            <div className="brand-name">
              LexiRead

              <span className="brand-badge">
                AI Assistant
              </span>
            </div>

            <div className="brand-subtitle">
              Dyslexia-Friendly Adaptive Reader
            </div>
          </div>
        </div>

        <nav className="navigation">

          <button
            className={`nav-button ${
              view === 'text' ? 'active' : ''
            }`}
            onClick={() => setView('text')}
          >
            📝
            <span>Type / Paste</span>
          </button>

          <button
            className={`nav-button ${
              view === 'upload' ? 'active' : ''
            }`}
            onClick={() => setView('upload')}
          >
            ⬆
            <span>Upload File</span>
          </button>

        </nav>

      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-content">

        {/* ===================================================
            TEXT INPUT VIEW
        ==================================================== */}

        {view === 'text' && (
          <section className="workspace">

            <div className="intro">

              <div className="feature-label">
                ✦
                <span>Accessible Reading Assistant</span>
              </div>

              <h1>
                Enter Text for
                <br />
                Accessible Reading
              </h1>

              <p>
                Type or paste text below to preview it
                in the reading assistant.
              </p>

            </div>

            <form
              className="card"
              onSubmit={handleTextSubmit}
            >

              <div className="card-header">

                <h2>
                  Enter Your Text
                </h2>

                <p>
                  Type or paste any text you want to read.
                </p>

              </div>

              <textarea
                className="text-input"
                value={inputText}
                onChange={(event) =>
                  setInputText(event.target.value)
                }
                placeholder="Type or paste your text here..."
              />

              <div className="input-footer">

                <div className="text-statistics">

                  <span>
                    {wordCount} words
                  </span>

                  <span>
                    {characterCount} characters
                  </span>

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

            {/* ===============================================
                DISPLAYED TEXT
            ================================================ */}

            {displayedText && (
              <section className="card result-card">

                <div className="result-header">

                  <div>

                    <div className="result-label">
                      TEXT PREVIEW
                    </div>

                    <h2>
                      Your Entered Text
                    </h2>

                  </div>

                </div>

                <div className="displayed-text">
                  {displayedText}
                </div>

              </section>
            )}

          </section>
        )}

        {/* ===================================================
            FILE UPLOAD VIEW
        ==================================================== */}

        {view === 'upload' && (
          <section className="workspace upload-workspace">

            <div className="intro">

              <div className="feature-label">
                ↑
                <span>Document Input</span>
              </div>

              <h1>
                Upload a Document
              </h1>

              <p>
                Select an image or PDF file.
                File processing will be added in a later stage.
              </p>

            </div>

            <section className="card">

              <div
                className={`drop-zone ${
                  dragOver ? 'drag-over' : ''
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => {
                  setDragOver(false);
                }}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileInputChange}
                  hidden
                />

                <div className="upload-icon">
                  ↑
                </div>

                <h2>
                  {selectedFile
                    ? selectedFile.name
                    : 'Click to select or drag & drop a file'}
                </h2>

                <p>
                  Supported files: PDF, PNG, JPG, JPEG and WebP
                </p>

                {!selectedFile && (
                  <span className="upload-note">
                    File upload only — OCR is not enabled yet.
                  </span>
                )}

              </div>

              {/* =============================================
                  SELECTED FILE
              ============================================== */}

              {selectedFile && (
                <div className="file-information">

                  <div className="file-details">

                    <div className="file-icon">
                      {selectedFile.type === 'application/pdf'
                        ? 'PDF'
                        : 'IMG'}
                    </div>

                    <div>

                      <strong>
                        {selectedFile.name}
                      </strong>

                      <span>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)}
                        {' MB'}
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>

                </div>
              )}

            </section>

            <div className="stage-note">

              <strong>
                Stage 1
              </strong>

              <span>
                The application currently accepts text input
                and file selection. OCR, text extraction,
                simplification and reading assistance are
                intentionally not implemented yet.
              </span>

            </div>

          </section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">

        <strong>
          Dyslexia-Friendly Reading Assistant
        </strong>

        <span>
          Final Year B.E. Project (CSE)
        </span>

      </footer>

    </div>
  );
}

export default App;
