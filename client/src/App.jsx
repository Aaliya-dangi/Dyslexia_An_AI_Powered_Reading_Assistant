import React, { useState } from 'react';
import { ReadingSettingsProvider, useReadingSettings } from './context/ReadingSettingsContext';
import Navbar from './components/Navbar';
import TextInputView from './components/TextInputView';
import FileUploadView from './components/FileUploadView';
import ReadingView from './components/ReadingView';
import SettingsBar from './components/SettingsBar';
import ReadingRuler from './components/ReadingRuler';
import { submitTextDocument, uploadDocumentFile, changeSimplificationLevel } from './services/api';

function MainApp() {
  const [currentView, setCurrentView] = useState('input'); // 'input' | 'upload' | 'reading'
  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Submit plain text handler
  const handleSubmitText = async ({ text, title, simplificationLevel }) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const doc = await submitTextDocument({ text, title, simplificationLevel });
      setActiveDocument(doc);
      setCurrentView('reading');
    } catch (err) {
      console.error('Text submission error:', err);
      setErrorMessage(err.message || 'Failed to simplify text. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file OCR handler
  const handleUploadFile = async ({ file, title, simplificationLevel }) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const doc = await uploadDocumentFile({ file, title, simplificationLevel });
      setActiveDocument(doc);
      setCurrentView('reading');
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Failed to extract text from file. Please ensure the image or PDF is clear.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-simplify active document with updated level
  const handleReSimplify = async (newLevel) => {
    if (!activeDocument?._id) return;
    setIsLoading(true);
    try {
      const updated = await changeSimplificationLevel(activeDocument._id, newLevel);
      setActiveDocument(updated);
    } catch (err) {
      console.error('Re-simplification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-all duration-200"
         style={{
           backgroundColor: 'var(--bg-main)',
           color: 'var(--text-main)'
         }}>
      
      {/* Visual Reading Focus Ruler */}
      <ReadingRuler />

      {/* Main Top Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        activeDocument={activeDocument}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(prev => !prev)}
      />

      {/* Global Error Banner if any */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-6 w-full">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline ml-4 hover:opacity-75">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 transition-all duration-200">
        {currentView === 'input' && (
          <TextInputView
            onSubmitText={handleSubmitText}
            isLoading={isLoading}
          />
        )}

        {currentView === 'upload' && (
          <FileUploadView
            onUploadFile={handleUploadFile}
            isLoading={isLoading}
          />
        )}

        {currentView === 'reading' && activeDocument && (
          <ReadingView
            document={activeDocument}
            onBack={() => setCurrentView('input')}
            onReSimplify={handleReSimplify}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Dyslexia Settings & Tools Drawer */}
      <SettingsBar
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeDocument={activeDocument}
        onReSimplify={handleReSimplify}
      />

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs opacity-75 transition-all duration-200"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}>
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold">
            An Intelligent AI-Powered Dyslexia-Friendly Reading Assistant with Real-Time Adaptive Support
          </p>
          <p className="mt-1">
            Final Year B.E. Project (CSE) — Anjuman Institute of Technology & Management (AITM), Bhatkal
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ReadingSettingsProvider>
      <MainApp />
    </ReadingSettingsProvider>
  );
}
