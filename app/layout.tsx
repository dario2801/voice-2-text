import type { Metadata, Viewport } from "next";
import { DM_Mono, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
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

const SITE_URL = "https://voice2text.audaworks.com";
const SITE_NAME = "Voice-2-Text";
const AUTHOR_NAME = "Dario Auda";
const AUTHOR_URL = "https://portfolio.audaworks.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Voice-2-Text — Free Audio Transcription & Translation",
    template: "%s | Voice-2-Text",
  },
  description:
    "Free online tool to transcribe any audio file in its original language, or translate it to English, instantly. Powered by Whisper AI. More languages coming soon. Supports OGG, MP3, WAV, M4A, FLAC, WebM, and AAC. No signup. A free AUDAWORKS AI tool.",
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: "technology",
  keywords: [
    "voice to text",
    "audio transcription",
    "speech to text",
    "audio translation",
    "whisper ai",
    "transcribe audio online",
    "translate audio to english",
    "voice transcription online",
    "audio to text converter",
    "free transcription tool",
    "mp3 to text",
    "wav to text",
    "transcribir audio",
    "audio a texto",
    "transcripción de audio gratis",
    "free ai tools",
    "audaworks",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Voice-2-Text — Free Audio Transcription & Translation",
    description:
      "Upload any audio file and get a clean transcript in its original language, or an English translation. Powered by Whisper AI. Free, no signup. A free AUDAWORKS AI tool.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voice-2-Text — audio transcription & translation tool by AUDAWORKS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice-2-Text — Free Audio Transcription & Translation",
    description:
      "Transcribe audio in its original language or translate it to English. Powered by Whisper AI. A free AUDAWORKS AI tool.",
    images: ["/og-image.png"],
    creator: "@audaworks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Replace with the token from Google Search Console once the domain is verified.
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Keep in sync with --color-bg in app/globals.css.
  themeColor: "#fafaf8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      alternateName: ["Voice to Text", "Voz a Texto"],
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (web-based)",
      browserRequirements: "Requires JavaScript. Modern browser.",
      description:
        "Transcribe any audio file in its original language, or translate it to English, using Whisper AI. More languages coming soon. Free, browser-based, no signup. A free AUDAWORKS AI tool.",
      inLanguage: "en",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Automatic language detection",
        "Transcription in the audio's original language",
        "Audio-to-English translation",
        "More target languages coming soon",
        "Supports OGG, MP3, WAV, M4A, FLAC, WebM, AAC",
        "Browser-based, no installation",
      ],
      author: { "@id": `${SITE_URL}/#person` },
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      sameAs: [AUTHOR_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Free online audio transcription and translation tool powered by Whisper AI. A free AUDAWORKS AI tool.",
      publisher: { "@id": `${SITE_URL}/#person` },
      inLanguage: "en",
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          nonce={nonce}
          // Browsers blank the nonce content attribute after load (CSP nonce
          // hiding), so the client DOM legitimately differs from SSR — this
          // is expected and benign, not a real mismatch.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {/* Print-proof crop marks framing the page (editorial signature). */}
        <div aria-hidden className="crop-frame">
          <span />
          <span />
          <span />
          <span />
        </div>
        {children}
      </body>
    </html>
  );
}
