import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voice-2-Text Audio Transcription & Translation",
    short_name: "Voice-2-Text",
    description:
      "Free browser-based tool to transcribe audio in its original language or translate it to English with Whisper AI. A free AUDAWORKS AI tool.",
    start_url: "/",
    display: "standalone",
    // Keep in sync with --color-bg in app/globals.css.
    background_color: "#fafaf8",
    theme_color: "#fafaf8",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities", "multimedia"],
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
