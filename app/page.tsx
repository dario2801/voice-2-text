"use client";

import { useState, useCallback } from "react";
import type { TranscriptionResult, OutputMode } from "./lib/types";
import { TARGET_LANGUAGES } from "./lib/languages";
import { Header } from "./components/Header";
import { DropZone } from "./components/DropZone";
import { ProcessingState } from "./components/ProcessingState";
import { TranscriptionResult as ResultPanel } from "./components/TranscriptionResult";
import { usePageIntro } from "./animations/usePageIntro";

const MODES: { value: OutputMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "english", label: "English" },
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<OutputMode>("english");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const introScope = usePageIntro();

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
    formData.append("mode", mode);

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
    <div
      ref={introScope}
      className="h-dvh flex flex-col max-w-[1180px] mx-auto px-10 py-9 max-md:px-5 max-md:py-6"
    >
      <Header />

      <main className="flex-1 flex flex-col min-h-0 gap-6 max-md:gap-5">
        {/* Two equal panels: source (human) | transcript (machine).
            Both sections are flex-1 in the same row, so they are always
            exactly the same size. Controls live below, full width, so they
            never shrink either panel. */}
        <div className="relative flex-1 flex gap-14 min-h-0 max-md:flex-col max-md:gap-6">
          {/* Center spine — the real hand engraving drops in here later
              (see app/components/HeroMotif.tsx + docs/PRE-LAUNCH-ASSETS.md). */}
          <div
            aria-hidden
            className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-px bg-text/10 max-md:hidden"
          />

          {/* Left — source */}
          <section
            className="relative z-10 flex-1 min-h-0 flex flex-col"
            data-animate
          >
            <DropZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
            {isProcessing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface border border-border rounded-sm p-8">
                <ProcessingState />
              </div>
            )}
          </section>

          {/* Right — transcript */}
          <section
            className="relative z-10 flex-1 min-h-0 flex flex-col"
            data-animate
          >
            <div className="flex-1 min-h-0 flex flex-col bg-surface border border-border rounded-sm p-7 max-md:p-6 overflow-hidden">
              {result ? (
                <ResultPanel result={result} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <span className="font-serif italic text-2xl text-text-muted leading-none">
                    {isProcessing ? "Listening" : "Awaiting audio"}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-text-muted">
                    {isProcessing
                      ? "The machine is transcribing"
                      : "Your transcript will appear here"}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Controls — full width, beneath both panels */}
        <div className="shrink-0" data-animate>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                Output
              </span>
              <span className="flex-1 h-px bg-text/10" aria-hidden />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="inline-flex rounded-sm border border-border overflow-hidden">
                {MODES.map((m) => {
                  const active = mode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMode(m.value)}
                      className={`font-mono text-[10px] tracking-[0.18em] uppercase px-4 py-3 min-h-[44px] transition-colors duration-300 cursor-pointer ${
                        active
                          ? "bg-accent text-bg"
                          : "bg-transparent text-text-dim hover:text-text"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <span className="w-px h-5 bg-border mx-1" aria-hidden />
              {TARGET_LANGUAGES.map((lang) => (
                <span
                  key={lang.code}
                  title="Direct translation to this language is coming soon"
                  className="font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-2.5 rounded-sm border border-dashed border-border text-text-muted cursor-not-allowed select-none"
                >
                  {lang.label}
                  <sup className="ml-1 normal-case tracking-normal text-[8px] opacity-70">
                    soon
                  </sup>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-center max-sm:flex-col">
            <button
              className="flex-1 font-mono text-[11px] font-medium tracking-[0.25em] uppercase text-bg bg-accent border-none py-3.5 px-8 rounded-sm cursor-pointer transition-all duration-300 relative overflow-hidden hover:not-disabled:bg-accent-hover hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_6px_28px_var(--color-accent-dim)] active:not-disabled:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!selectedFile || isProcessing}
              onClick={handleSubmit}
            >
              {mode === "english" ? "Translate to English" : "Transcribe"}
            </button>
            <button
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-dim bg-transparent border border-border py-3.5 px-5 rounded-sm cursor-pointer transition-all duration-300 hover:border-text-dim hover:text-text max-sm:w-full"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 py-4 px-5 bg-error-surface border-l-2 border-error rounded-r-sm text-xs text-error tracking-[0.03em] animate-[result-in_0.4s_ease_forwards]"
            >
              {error}
            </div>
          )}
        </div>
      </main>

      <footer
        className="shrink-0 pt-4 mt-7 max-md:mt-5 border-t border-border text-[10px] text-text-muted tracking-[0.12em] uppercase flex justify-between items-center gap-4 max-sm:flex-col max-sm:items-start"
        data-animate
      >
        <span>Voice&middot;2&middot;Text &mdash; Whisper&nbsp;AI</span>
        <nav aria-label="Author projects" className="flex gap-6">
          <a
            href="https://portfolio.audaworks.com"
            target="_blank"
            rel="noopener"
            className="hover:text-text transition-colors"
          >
            Portfolio
          </a>
          <a
            href="https://store.audaworks.com"
            target="_blank"
            rel="noopener"
            className="hover:text-text transition-colors"
          >
            Auda Shop
          </a>
        </nav>
        <span>&copy; 2026 Dario Auda</span>
      </footer>
    </div>
  );
}
