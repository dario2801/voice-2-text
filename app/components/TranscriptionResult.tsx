import { useState } from "react";
import type { TranscriptionResult as Result } from "../lib/types";

interface TranscriptionResultProps {
  result: Result;
}

export function TranscriptionResult({ result }: TranscriptionResultProps) {
  const [copyLabel, setCopyLabel] = useState("Copy text");

  const handleCopy = () => {
    navigator.clipboard.writeText(result.text).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy text"), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-[result-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.25em] uppercase text-text-dim">
          Translation
        </span>
        <span className="text-[10px] tracking-[0.15em] uppercase text-amber bg-amber-glow px-3 py-1 rounded-sm border border-amber-dim">
          Detected: {result.language}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto font-serif text-[clamp(18px,2.5vw,24px)] italic leading-[1.6] text-text p-6 bg-surface border-l-2 border-amber rounded-r-sm relative before:content-['\201C'] before:absolute before:top-3 before:left-3 before:font-serif before:text-4xl before:text-amber before:opacity-20 before:leading-none">
        {result.text}
      </div>
      <button
        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-text-dim bg-transparent border border-border px-3.5 py-2 rounded-sm cursor-pointer mt-3 transition-all duration-300 hover:border-text-dim hover:text-text self-start"
        onClick={handleCopy}
      >
        {copyLabel}
      </button>
    </div>
  );
}
