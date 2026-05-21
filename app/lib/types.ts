// API contract shared by the transcribe route and its UI consumers.
// Release 1 is Whisper-only: it produces the source-language transcription
// ("original") and/or an English translation. The shape is intentionally a
// list of `outputs` so a future translation engine (argos/API) can add more
// languages without changing this contract or the UI.

/** Functional output modes available in release 1. */
export type OutputMode = "original" | "english";

/** Which Whisper task produced the result, for UI labelling / telemetry. */
export type TranscriptionEngine = "whisper-transcribe" | "whisper-translate";

/** A single timestamped subtitle segment from Whisper (times in seconds). */
export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface OutputItem {
  /** ISO-ish language code (Whisper-detected for `original`, "en" for english). */
  lang: string;
  /** Human-readable language label, e.g. "Spanish". */
  label: string;
  /** The transcribed/translated text. */
  text: string;
  /** Distinguishes the source-language panel from the English one. */
  kind: OutputMode;
  /**
   * Subtitle files rendered server-side from Whisper's segments. `null` when
   * the audio has no speech segments, so the UI can hide the SRT/VTT download
   * buttons. The plain-text (.txt) download uses `text` directly.
   */
  subtitles?: { srt: string; vtt: string } | null;
}

export interface TranscriptionResult {
  /** Whisper-detected source language code. */
  sourceLang: string;
  /** Human-readable label for `sourceLang`. */
  sourceLangLabel: string;
  /** One or more produced outputs. Release 1: a single item. */
  outputs: OutputItem[];
  /** Which Whisper task ran. */
  engine: TranscriptionEngine;
  /** Audio duration in seconds (from ffprobe; also used by the duration cap). */
  durationSec: number;
}

export interface ApiError {
  /** Generic, client-safe message (never a stack trace or path). */
  error: string;
  /** Stable machine-readable code for the UI / debugging. */
  code?: string;
}
