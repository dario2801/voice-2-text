# Contributing to Voice‑2‑Text

Thanks for your interest! This is a free, open‑source AUDAWORKS tool.

## Ground rules

- Be respectful — see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
- `main` is **protected**: no direct pushes. Work on a branch and open a Pull
  Request.
- Keep the project's **security‑first** posture and **single‑instance /
  minimal‑dependency** architecture (see the README "Deployment" note — this
  is not a serverless app, by design).
- Don't break the `/api/transcribe` contract (`app/lib/types.ts`) or weaken
  the upload validation pipeline without discussion.

## Dev setup

```bash
npm install
npm run dev
```

For the transcription endpoint you also need Python + `openai-whisper` and a
recent `ffmpeg`/`ffprobe` on `PATH` (see README → Requirements).

## Before you open a PR

Run and make sure these pass:

```bash
npx tsc --noEmit
npm run build
```

- No color literals outside `app/globals.css` `@theme` (palette swap must stay
  a single edit).
- Respect `prefers-reduced-motion`; keep WCAG AA contrast.
- New animations: use `transform`/`opacity`, 150–300ms, reduced‑motion fallback.
- Update docs (`README.md`, `docs/`) when behavior or config changes.

## Branching & commits

- Branch from `main`: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Clear, imperative commit messages.
- Fill in the PR template; link related issues; describe testing done.

## Reporting bugs / requesting features

Use the issue templates. **Security issues:** do **not** file a public
issue — follow [SECURITY.md](./SECURITY.md).
