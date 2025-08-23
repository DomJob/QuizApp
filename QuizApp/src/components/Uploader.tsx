import { useRef, useState } from 'react';
import { readFileAsText, fetchQuizFromUrl } from '../utils/fileUtils';

interface UploaderProps {
  onLoadQuiz: (text: string) => void;
  onShowSpinner: () => void;
  uploadStatus: string;
}

const DEFAULT_URL = "https://quiz.qot.app/example";

export function Uploader({ onLoadQuiz, onShowSpinner, uploadStatus }: UploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlValue, setUrlValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    try {
      onShowSpinner();
      const text = await readFileAsText(file);
      onLoadQuiz(text);
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const handleUrlLoad = async () => {
    const url = urlValue.trim() || DEFAULT_URL;
    try {
      onShowSpinner();
      const text = await fetchQuizFromUrl(url);
      onLoadQuiz(text);
    } catch (error) {
      console.error('Failed to fetch from URL:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.currentTarget === e.target) {
        handleDropzoneClick();
      } else {
        handleUrlLoad();
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="source">
          <span className="dot"></span>
        </div>
        <div className="progress"></div>
      </div>
      <div className="card-body">
        <div
          className={`dropzone ${isDragOver ? 'hover' : ''}`}
          tabIndex={0}
          role="button"
          aria-label="Choose a questions file to start the quiz"
          onClick={handleDropzoneClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={handleKeyDown}
        >
          <div className="dz-icon">↑</div>
          <div className="dz-title">Drag & drop your question file here</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".quiz,.txt,.*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            border: 0,
          }}
        />
        <div className="or-sep">or</div>
        <div className="url-loader">
          <input
            className="url-input"
            type="url"
            inputMode="url"
            placeholder="https://quiz.qot.app/example"
            aria-label="Quiz file URL"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" onClick={handleUrlLoad}>
            Load
          </button>
        </div>
        {uploadStatus && (
          <div className="status" style={{ marginTop: '12px' }}>
            {uploadStatus}
          </div>
        )}
      </div>
      <div className="controls" style={{ justifyContent: 'flex-end' }}>
        <div className="right-controls">
          <div className="status"></div>
        </div>
      </div>
    </div>
  );
}
