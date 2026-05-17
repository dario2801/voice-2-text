// Single source of truth for language metadata, shared by the client selector
// and server-side label resolution. Keep this free of server-only imports so
// it is safe in both client and server components.

export interface TargetLanguage {
  code: string;
  /** English label shown in the UI. */
  label: string;
  /** Endonym (native name) shown as a hint. */
  native: string;
  /**
   * Whether real translation to this language is wired up. Release 1 ships
   * Whisper-only (source language + English), so the named targets below are
   * scaffolded but disabled ("coming soon") until a translation engine is
   * plugged in. Flipping these to `true` is all the UI needs.
   */
  enabled: boolean;
}

/**
 * Designed target set: ES, EN, FR, DE, PT, IT. English is delivered through
 * the Whisper "translate" task (always available, handled by the mode toggle),
 * so it is not listed as a toggleable chip here — these are the *additional*
 * languages awaiting a translation engine.
 */
export const TARGET_LANGUAGES: readonly TargetLanguage[] = [
  { code: "es", label: "Spanish", native: "Español", enabled: false },
  { code: "fr", label: "French", native: "Français", enabled: false },
  { code: "de", label: "German", native: "Deutsch", enabled: false },
  { code: "pt", label: "Portuguese", native: "Português", enabled: false },
  { code: "it", label: "Italian", native: "Italiano", enabled: false },
] as const;

/**
 * Broad map for resolving a human label from a Whisper-detected source
 * language code (Whisper detects far more than the target set above).
 */
export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  uk: "Ukrainian",
  pl: "Polish",
  tr: "Turkish",
  ar: "Arabic",
  he: "Hebrew",
  fa: "Persian",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  vi: "Vietnamese",
  id: "Indonesian",
  th: "Thai",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  cs: "Czech",
  el: "Greek",
  ro: "Romanian",
  hu: "Hungarian",
  ca: "Catalan",
};

/** Resolve a display label for any language code, with a safe fallback. */
export function labelForLanguage(code: string): string {
  if (!code) return "Unknown";
  return LANGUAGE_LABELS[code.toLowerCase()] ?? code.toUpperCase();
}
