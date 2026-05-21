"use client";

import { useState } from "react";
import type {
  TranscriptionResult as Result,
  OutputItem,
} from "../lib/types";
import { useTextReveal } from "../animations/useTextReveal";

// Shared styling for the secondary actions (Copy + downloads), so they read as
// one row. Keeps the mono/uppercase editorial look and a 44px touch target.
const ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-text-dim bg-transparent border border-border px-4 py-2.5 min-h-[44px] rounded-sm cursor-pointer transition-colors duration-300 hover:border-accent hover:text-text";

/**
 * Save a string as a file. The content is produced server-side (SRT/VTT) or is
 * the transcript text we already received; this only wraps it in a Blob and
 * triggers the browser's download — no network call, no server round-trip.
 */
function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function OutputPanel({
  output,
  sourceLangLabel,
}: {
  output: OutputItem;
  sourceLangLabel: string;
}) {
  const [copyLabel, setCopyLabel] = useState("Copy");
  const textRef = useTextReveal(output.text);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.text).then(() => {
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    });
  };

  const heading =
    output.kind === "english"
      ? "English translation"
      : "Original transcription";
  const metaLabel = output.kind === "english" ? "From" : "Detected";

  // `const` so the narrowing below survives into the download click handlers.
  const subtitles = output.subtitles;
  const hasText = output.text.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-text">
          {heading}
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-dim shrink-0">
          {metaLabel} &middot; {sourceLangLabel}
        </span>
      </div>
      <div className="h-px bg-text/15 mb-5" aria-hidden />

      <div
        ref={textRef}
        className="flex-1 overflow-y-auto pr-1 font-serif text-[clamp(17px,2.1vw,22px)] leading-[1.65] text-text
          first-letter:float-left first-letter:font-serif first-letter:not-italic
          first-letter:text-[3.4em] first-letter:leading-[0.78] first-letter:pr-3
          first-letter:pt-1 first-letter:text-accent"
      >
        {output.text || (
          <span className="font-mono text-xs not-italic tracking-[0.1em] uppercase text-text-muted">
            (no speech detected)
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-5">
        <span className="flex-1 h-px bg-text/10" aria-hidden />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button onClick={handleCopy} className={ACTION_BUTTON_CLASS}>
            {copyLabel}
          </button>
          {hasText && (
            <button
              type="button"
              aria-label="Download transcript as a plain-text .txt file"
              onClick={() =>
                triggerDownload(
                  `transcript-${output.lang}.txt`,
                  output.text,
                  "text/plain;charset=utf-8"
                )
              }
              className={ACTION_BUTTON_CLASS}
            >
              .txt
            </button>
          )}
          {subtitles && (
            <>
              <button
                type="button"
                aria-label="Download subtitles as an .srt file"
                onClick={() =>
                  triggerDownload(
                    `subtitles-${output.lang}.srt`,
                    subtitles.srt,
                    "application/x-subrip;charset=utf-8"
                  )
                }
                className={ACTION_BUTTON_CLASS}
              >
                .srt
              </button>
              <button
                type="button"
                aria-label="Download subtitles as a WebVTT .vtt file"
                onClick={() =>
                  triggerDownload(
                    `subtitles-${output.lang}.vtt`,
                    subtitles.vtt,
                    "text/vtt;charset=utf-8"
                  )
                }
                className={ACTION_BUTTON_CLASS}
              >
                .vtt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TranscriptionResult({ result }: { result: Result }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 gap-8 animate-[result-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {result.outputs.map((output, i) => (
        <OutputPanel
          key={`${output.kind}-${output.lang}-${i}`}
          output={output}
          sourceLangLabel={result.sourceLangLabel}
        />
      ))}
    </div>
  );
}
