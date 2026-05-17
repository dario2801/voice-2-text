# Voice‑2‑Text

A free, browser‑based tool to **transcribe any audio file in its original
language, or translate it to English** — powered by [OpenAI Whisper][whisper].
Part of the **AUDAWORKS** free AI tools. Live at
**[voice2text.audaworks.com](https://voice2text.audaworks.com)**.

> Editorial black‑and‑white design, security‑first, no signup, no tracking.

## Features

- Drag‑and‑drop audio → clean transcript (source language) **or** English translation
- Automatic source‑language detection (Whisper)
- Strict, defense‑in‑depth upload validation (see [Security](#security))
- GSAP‑powered, reduced‑motion‑aware UI
- Accessible (WCAG AA contrast, keyboard‑operable, `prefers-reduced-motion`)
- Designed multi‑language target set (ES/EN/FR/DE/PT/IT) scaffolded for a future
  translation engine — see [Roadmap](#roadmap)

## ⚠️ Deployment: this does NOT run on Vercel/serverless

The `/api/transcribe` route shells out to **Python (`openai-whisper`)** and
**`ffmpeg`/`ffprobe`**, writes temp files, and keeps in‑process state
(rate‑limit + concurrency). That requires a **single, persistent server**:

- ✅ VPS / Docker / a long‑lived VM / Render / Fly.io / Railway (Dockerfile)
- ❌ Vercel, Netlify Functions, or any serverless/edge runtime (no Python, no
  ffmpeg, no persistent FS, memory/time limits too low for Whisper, and the
  in‑memory limiter is per‑invocation there)

The Next.js frontend itself would deploy anywhere, but the core transcription
feature only works on a persistent host.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · GSAP · TypeScript ·
Whisper (Python subprocess) · ffmpeg/ffprobe.

## Requirements (server / local dev with transcription)

- **Node.js** ≥ 18 (20 recommended)
- **Python** 3.11–3.12 recommended (newer may lack Torch wheels)
  - `pip install -U openai-whisper`
- **ffmpeg** + **ffprobe** on `PATH` — **use a recent build** (the demuxer is
  the real attack surface for masqueraded media; keep it patched)

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

Build / checks:

```bash
npx tsc --noEmit
npm run build
npm start          # production server (needs Python + ffmpeg for /api/transcribe)
```

> On Windows, antivirus can intermittently lock `.next` during
> `next build` (EPERM/ENOENT on `.next/trace`). Exclude the project's `.next`
> from AV, or just retry — it builds cleanly on Linux/CI.

## Configuration (environment variables)

All optional; sensible defaults shown.

| Variable | Default | Purpose |
|---|---|---|
| `TRANSCRIBE_MAX_CONCURRENCY` | `1` | Simultaneous Whisper runs |
| `TRANSCRIBE_MAX_QUEUE` | `4` | Queued requests before 503 |
| `RATE_LIMIT_MAX` | `5` | Requests per window per IP |
| `RATE_LIMIT_WINDOW_MS` | `600000` | Rate‑limit window (ms) |
| `RATE_LIMIT_MAX_ENTRIES` | `10000` | Max tracked IPs (memory cap) |
| `TRUST_PROXY` | _unset_ | Set `1` only behind a trusted reverse proxy (enables `x-forwarded-for`) |
| `TRANSCRIBE_MAX_DURATION_SEC` | `600` | Reject audio longer than this |
| `TRANSCRIBE_TIMEOUT_MS` | `300000` | Whisper subprocess timeout |
| `FFPROBE_TIMEOUT_MS` | `15000` | ffprobe subprocess timeout |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | _unset_ | Search Console token |

> The in‑memory rate‑limit and concurrency limiter are **correct only on a
> single instance** (by design). Multi‑instance needs a shared store (out of
> scope — minimal‑dependency goal).

## Security

This project is security‑first (OWASP Top 10). Highlights: streaming body‑size
cap, early `Content-Length` rejection, in‑memory magic‑byte check **before**
disk write, `ffprobe` content + duration validation, no‑shell `execFile`,
OS‑temp isolation with guaranteed cleanup, per‑IP rate limiting, concurrency
semaphore, strict CSP (nonce + `strict-dynamic`) and security headers.

Found a vulnerability? See [SECURITY.md](./SECURITY.md) — **please do not open
a public issue.**

## Roadmap

- Real human↔machine hero illustration (see `docs/PRE-LAUNCH-ASSETS.md`)
- Pluggable translation engine to light up ES/FR/DE/PT/IT (UI already scaffolded)
- favicon / apple‑touch / OG image assets

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). `main` is protected — open a PR.

## License

[MIT](./LICENSE) © 2026 Dario Auda · [Portfolio](https://portfolio.audaworks.com)
· [Auda Shop](https://store.audaworks.com)

[whisper]: https://github.com/openai/whisper
