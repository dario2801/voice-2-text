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
    <div className="result">
      <div className="result-header">
        <span className="result-label">Translation</span>
        <span className="result-lang">Detected: {result.language}</span>
      </div>
      <div className="result-text">{result.text}</div>
      <button className="copy-btn" onClick={handleCopy}>
        {copyLabel}
      </button>
    </div>
  );
}
