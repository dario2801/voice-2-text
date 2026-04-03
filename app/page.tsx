"use client";

import { useState, useRef, useCallback } from "react";

interface TranscriptionResult {
  text: string;
  language: string;
}

function Spinner() {
  const bars = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.sin(rad) * 8;
    const ty = -Math.cos(rad) * 8;
    return (
      <div
        key={i}
        className="spinner-bar"
        style={{
          transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${angle}deg)`,
          animationDelay: `${i * 0.125}s`,
        }}
      />
    );
  });
  return <div className="spinner">{bars}</div>;
}

function Waveform() {
  const bars = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className="wave-bar"
      style={{
        animationDelay: `${i * 0.06}s`,
        animationDuration: `${0.8 + Math.random() * 0.8}s`,
      }}
    />
  ));
  return <div className="waveform">{bars}</div>;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearState = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setResult(null);
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("audio", selectedFile);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy text"), 2000);
    });
  };

  const dropZoneClasses = [
    "drop-zone",
    isDragOver && "drag-over",
    selectedFile && "has-file",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container">
      <header>
        <div className="logo">Voice-2-Text</div>
        <h1 className="title">
          Audio to English,
          <br />
          instantly.
        </h1>
        <p className="subtitle">
          Upload any audio file. We&apos;ll detect the language and transcribe it
          to English using Whisper AI.
        </p>
        <div className="divider" />
      </header>

      <main>
        <div
          className={dropZoneClasses}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <svg
            className="drop-icon"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M24 32V12M24 12l-8 8M24 12l8 8" />
            <path d="M8 36h32" />
          </svg>
          <div className="drop-label">
            Drop audio file here or click to browse
          </div>
          <div className="drop-hint">
            ogg / mp3 / wav / m4a / flac / webm / aac &mdash; max 25 mb
          </div>
          {selectedFile && (
            <div className="file-name">
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ogg,.mp3,.wav,.m4a,.flac,.webm,.aac,.wma,.opus,audio/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.length) handleFile(e.target.files[0]);
            }}
          />
        </div>

        <div className="actions">
          <button
            className="btn-submit"
            disabled={!selectedFile || isProcessing}
            onClick={handleSubmit}
          >
            Translate
          </button>
          <button className="btn-clear" onClick={clearState}>
            Clear
          </button>
        </div>

        {isProcessing && (
          <>
            <Waveform />
            <div className="processing">
              <Spinner />
              <span className="processing-text">
                Transcribing &amp; translating...
              </span>
            </div>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-header">
              <span className="result-label">Translation</span>
              <span className="result-lang">
                Detected: {result.language}
              </span>
            </div>
            <div className="result-text">{result.text}</div>
            <button className="copy-btn" onClick={handleCopy}>
              {copyLabel}
            </button>
          </div>
        )}
      </main>

      <footer>
        <span>Voice-2-Text &mdash; Powered by Whisper</span>
        <span>&copy; 2026</span>
      </footer>
    </div>
  );
}
