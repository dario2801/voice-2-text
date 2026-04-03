"use client";

import { useState, useCallback } from "react";
import type { TranscriptionResult } from "./lib/types";
import { Header } from "./components/Header";
import { DropZone } from "./components/DropZone";
import { ProcessingState } from "./components/ProcessingState";
import { TranscriptionResult as ResultPanel } from "./components/TranscriptionResult";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  }, []);

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

  return (
    <div className="container">
      <Header />

      <main>
        <DropZone onFileSelect={handleFileSelect} selectedFile={selectedFile} />

        <div className="actions">
          <button
            className="btn-submit"
            disabled={!selectedFile || isProcessing}
            onClick={handleSubmit}
          >
            Translate
          </button>
          <button className="btn-clear" onClick={handleClear}>
            Clear
          </button>
        </div>

        {isProcessing && <ProcessingState />}
        {error && <div className="error-message">{error}</div>}
        {result && <ResultPanel result={result} />}
      </main>

      <footer>
        <span>Voice-2-Text &mdash; Powered by Whisper</span>
        <span>&copy; 2026</span>
      </footer>
    </div>
  );
}
