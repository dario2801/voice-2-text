# Deploying Voice‑2‑Text

This app needs a **persistent server** with Node + Python + `ffmpeg` (it runs
Whisper as a subprocess). It does **not** work on Vercel/Netlify/serverless.
Plan for **~3–4 GB RAM** (Whisper "small" model) and CPU‑bound transcription
(short clips take tens of seconds on CPU).

## 1. Quickest: Docker (any Ubuntu/Linux box, a VM, or your PC)

```bash
git clone https://github.com/dario2801/voice-2-text.git
cd voice-2-text
docker compose up -d --build      # first build is large/slow (pulls Torch + model)
```

Open `http://localhost:3000`. Logs: `docker compose logs -f`.
Stop: `docker compose down`.

The Whisper model is cached in a Docker volume (`whisper-cache`), so rebuilds
don't re‑download it.

Without compose:

```bash
docker build -t voice2text .
docker run -d --name voice2text -p 3000:3000 --restart unless-stopped voice2text
```

## 2. Bare Ubuntu (no Docker)

```bash
sudo apt update && sudo apt install -y nodejs npm python3 python3-pip ffmpeg
sudo npm i -g pm2
pip3 install -U openai-whisper            # add --break-system-packages if needed
git clone https://github.com/dario2801/voice-2-text.git && cd voice-2-text
npm ci && npm run build
TRUST_PROXY=1 pm2 start "npm start" --name voice2text
pm2 save && pm2 startup
```

> The API calls `python` (not `python3`). If only `python3` exists:
> `sudo ln -sf /usr/bin/python3 /usr/local/bin/python` (the Docker image does
> this for you).

## 3. Your PC as an online server — safely

Do **not** port‑forward your router (exposes your home IP and an open port).
Use a **Cloudflare Tunnel** (free): outbound‑only, automatic HTTPS, hides your
IP — which fits this project's security posture.

```bash
# 1. Run the app locally (Docker compose or pm2) on :3000
# 2. Install cloudflared, then:
cloudflared tunnel login
cloudflared tunnel create voice2text
cloudflared tunnel route dns voice2text voice2text.audaworks.com
cloudflared tunnel run --url http://localhost:3000 voice2text
```

Set `TRUST_PROXY=1` (compose env or pm2) so per‑IP rate limiting is accurate
behind the tunnel. Keep your PC awake/online for it to serve.

## 4. Free / cheap hosts that actually work

Persistent containers only — **not** Vercel/Netlify functions.

| Host | Free? | Notes |
|---|---|---|
| **Oracle Cloud — Always Free VM** | Yes (genuinely free) | Best self‑host: up to 4 ARM cores / 24 GB RAM free. Treat like §2/§1 + Cloudflare Tunnel. |
| **Hugging Face Spaces (Docker SDK)** | Yes (free CPU) | Great fit for a Whisper demo. Add this repo's `Dockerfile`; expose port 3000 (`app_port: 3000` in the Space README). Cold starts + public by default. |
| **Fly.io** | Small free allowance | `fly launch` detects the Dockerfile. Give it ≥2 GB RAM (`fly scale memory 4096`). |
| **Render** | Free web service | Works but the free tier **sleeps** when idle (slow first hit) and has limited RAM — may be tight for Whisper. |
| **Railway** | Trial credit | Deploys the Dockerfile easily; not permanently free. |
| **Google Cloud Run** | Free tier | Containers OK, but it scales to zero and has request timeouts; long CPU transcriptions may hit limits and the in‑memory limiter resets per instance. Usable for light/demo use with caveats. |

## Production checklist

- Put HTTPS in front (Cloudflare Tunnel, or Caddy/Nginx). HSTS header is already set.
- `TRUST_PROXY=1` only when actually behind a trusted proxy/tunnel.
- Keep **ffmpeg/ffprobe patched** (the demuxer is the real attack surface).
- Tune `RATE_LIMIT_MAX`, `TRANSCRIBE_MAX_CONCURRENCY`, `TRANSCRIBE_MAX_DURATION_SEC`
  to your hardware (see README → Configuration).
- First transcription after deploy warms the model — send one to pre‑warm.
- Single instance only (the rate‑limit/concurrency state is in‑process by design).
