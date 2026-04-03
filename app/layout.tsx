import type { Metadata } from "next";
import { DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Voice-2-Text | Audio Transcription & Translation Tool",
  description:
    "Transcribe and translate any audio file to English instantly. Powered by Whisper AI. Supports OGG, MP3, WAV, M4A, FLAC, WebM, and AAC formats.",
  keywords: [
    "voice to text",
    "audio transcription",
    "speech to text",
    "audio translation",
    "whisper ai",
    "transcribe audio",
    "translate audio to english",
    "voice transcription online",
    "audio to text converter",
  ],
  openGraph: {
    title: "Voice-2-Text | Audio Transcription & Translation",
    description:
      "Upload any audio file and get an instant English transcription. Powered by Whisper AI.",
    type: "website",
    locale: "en_US",
    siteName: "Voice-2-Text",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice-2-Text | Audio Transcription & Translation",
    description:
      "Upload any audio file and get an instant English transcription. Powered by Whisper AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
