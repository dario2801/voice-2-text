# Security Policy

Voice‑2‑Text is built with a security‑first approach (OWASP Top 10 hardening
of the upload/transcription pipeline). Responsible disclosure is appreciated.

## Reporting a vulnerability

**Please do NOT open a public GitHub issue for security problems.**

Instead, use **GitHub's private vulnerability reporting**:

1. Go to the repository's **Security** tab → **Report a vulnerability**
   (Private Vulnerability Reporting).
2. Describe the issue, impact, and reproduction steps.

Alternatively, reach the maintainer through
[portfolio.audaworks.com](https://portfolio.audaworks.com).

Please include: affected endpoint/file, a minimal PoC if possible, and the
potential impact. We aim to acknowledge reports within a reasonable time and
will credit reporters (unless anonymity is requested).

## Scope

In scope: the upload/transcription pipeline (`app/api/transcribe`),
auth‑less abuse/DoS vectors, CSP/headers, input validation, file handling.

Out of scope: issues that require a misconfigured deployment (e.g. running on
serverless against the documented requirements), or vulnerabilities in
third‑party tools (`ffmpeg`, `whisper`) — report those upstream, though we
will update pinned/patched versions.

## Hardening notes for operators

- Run behind a trusted reverse proxy and set `TRUST_PROXY=1` so per‑IP
  rate‑limiting is accurate.
- Keep **ffmpeg/ffprobe patched** — the demuxer is the real RCE surface for
  files masquerading as audio.
- Run the Python/ffmpeg subprocess with least privilege and OS‑level
  resource limits (cgroups/ulimit/container limits).
