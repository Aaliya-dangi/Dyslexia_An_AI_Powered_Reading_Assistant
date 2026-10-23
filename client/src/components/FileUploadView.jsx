import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';

export default function FileUploadView({ onUploadFile, isLoading }) {
  const { settings } = useReadingSettings();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onUploadFile({
      file: selectedFile,
      simplificationLevel: settings.simplificationLevel
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border"
             style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Optical Character Recognition (OCR)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Scan & Simplify Documents or PDFs
        </h1>
        <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
          Upload an image of a textbook page, worksheet, scan, or PDF file. Tesseract OCR will extract the text, clean up formatting artifacts, and simplify it into accessible reading blocks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border shadow-md space-y-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}>
        
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-500 scale-[1.01]'
              : 'hover:border-emerald-400'
          }`}
          style={{
            backgroundColor: 'var(--bg-main)',
            borderColor: dragOver ? 'var(--accent-color)' : 'var(--border-color)'
          }}>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                 style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              {selectedFile ? (
                selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-8 h-8 text-emerald-600" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-600" />
                )
              ) : (
                <UploadCloud className="w-8 h-8 opacity-70" />
              )}
            </div>

            <div>
              <p className="font-bold text-base sm:text-lg">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop document here'}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Supports Images (PNG, JPG, WebP) and PDF documents (up to 15MB)
              </p>
            </div>

            {selectedFile && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                   style={{ backgroundColor: 'var(--flag-bg)', color: 'var(--flag-text)', borderColor: 'var(--flag-border)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to scan</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview if available */}
        {previewUrl && (
          <div className="p-4 rounded-xl border flex items-center space-x-4"
               style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <img
              src={previewUrl}
              alt="Scan preview"
              className="w-20 h-20 object-cover rounded-lg border shadow-xs"
              style={{ borderColor: 'var(--border-color)' }}
            />
            <div>
              <div className="text-sm font-bold">Image Preview Loaded</div>
              <div className="text-xs opacity-75">Tesseract OCR will scan this image for text</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className={`w-full py-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg transition-all ${
              isLoading || !selectedFile
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-95 hover:scale-[1.005] active:scale-[0.99]'
            }`}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--accent-text)'
            }}>
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Running OCR Extraction & NLP Simplification...</span>
              </>
            ) : (
              <>
                <span>Extract Text & Simplify</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
