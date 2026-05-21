// Pure subtitle renderers shared by the transcribe route (server-side
// generation) and any future consumer. No server-only imports, so this stays
// safe to import anywhere. Times are in seconds, as Whisper reports them.

import type { SubtitleSegment } from "./types";

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

/**
 * Format a time in seconds as a subtitle timestamp. SRT uses a comma before
 * the milliseconds (`HH:MM:SS,mmm`); WebVTT uses a dot (`HH:MM:SS.mmm`).
 *
 * Everything is converted to integer milliseconds first so rounding can never
 * push the milliseconds field to 1000.
 */
function formatTimestamp(seconds: number, msSeparator: "," | "."): string {
  const totalMs = Math.max(0, Math.round((Number.isFinite(seconds) ? seconds : 0) * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}${msSeparator}${pad(millis, 3)}`;
}

/** Drop empty-text segments and keep only well-ordered, finite cues. */
function usableCues(segments: SubtitleSegment[]): SubtitleSegment[] {
  return segments
    .map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }))
    .filter(
      (s) =>
        s.text.length > 0 &&
        Number.isFinite(s.start) &&
        Number.isFinite(s.end) &&
        s.end >= s.start
    );
}

/** Render segments as SubRip (.srt). Returns "" when there is nothing to show. */
export function toSrt(segments: SubtitleSegment[]): string {
  const cues = usableCues(segments);
  if (cues.length === 0) return "";
  return (
    cues
      .map((cue, i) => {
        const start = formatTimestamp(cue.start, ",");
        const end = formatTimestamp(cue.end, ",");
        return `${i + 1}\n${start} --> ${end}\n${cue.text}`;
      })
      .join("\n\n") + "\n"
  );
}

/** Render segments as WebVTT (.vtt). Returns "" when there is nothing to show. */
export function toVtt(segments: SubtitleSegment[]): string {
  const cues = usableCues(segments);
  if (cues.length === 0) return "";
  const body = cues
    .map((cue) => {
      const start = formatTimestamp(cue.start, ".");
      const end = formatTimestamp(cue.end, ".");
      return `${start} --> ${end}\n${cue.text}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}
