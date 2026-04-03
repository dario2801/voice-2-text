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
    <div className="max-w-[720px] mx-auto px-6 pt-15 pb-20 max-sm:px-4 max-sm:pt-10 max-sm:pb-15">
      <Header />

      <main>
        <DropZone onFileSelect={handleFileSelect} selectedFile={selectedFile} />

        <div className="flex gap-3 items-center max-sm:flex-col">
          <button
            className="flex-1 font-mono text-[11px] font-medium tracking-[0.25em] uppercase text-bg bg-amber border-none py-[18px] px-8 rounded-sm cursor-pointer transition-all duration-300 relative overflow-hidden hover:not-disabled:bg-[#e0ad50] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_4px_24px_var(--color-amber-dim)] active:not-disabled:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!selectedFile || isProcessing}
            onClick={handleSubmit}
          >
            Translate
          </button>
          <button
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-dim bg-transparent border border-border py-[18px] px-5 rounded-sm cursor-pointer transition-all duration-300 hover:border-text-dim hover:text-text max-sm:w-full"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        {isProcessing && <ProcessingState />}

        {error && (
          <div className="mt-8 py-5 px-6 bg-[#1a1210] border-l-2 border-red rounded-r-sm text-xs text-red tracking-[0.03em] animate-[result-in_0.4s_ease_forwards]">
            {error}
          </div>
        )}

        {result && <ResultPanel result={result} />}
      </main>

      <footer className="mt-20 pt-6 border-t border-border text-[10px] text-text-muted tracking-[0.08em] uppercase flex justify-between">
        <span>Voice-2-Text &mdash; Powered by Whisper</span>
        <span>&copy; 2026</span>
      </footer>
    </div>
  );
}
