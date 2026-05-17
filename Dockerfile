# Voice-2-Text — long-running server image (Node + Python + ffmpeg + Whisper).
# This is NOT for serverless. Run it on a persistent host / your PC / a VM.
#
#   docker build -t voice2text .
#   docker run -d -p 3000:3000 --name voice2text voice2text
#
# Needs ~3-4 GB RAM available (Whisper "small" model).

FROM node:20-bookworm

# System deps: Python (the API shells out to `python`), ffmpeg + ffprobe.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv ffmpeg ca-certificates \
 && ln -sf /usr/bin/python3 /usr/local/bin/python \
 && rm -rf /var/lib/apt/lists/*

# Whisper (CPU build of torch is pulled in automatically).
# --break-system-packages is safe here: the container *is* the isolation (PEP 668).
RUN pip3 install --no-cache-dir --break-system-packages -U openai-whisper

WORKDIR /app

# Install JS deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# App source + production build.
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build \
 # Drop dev deps after building (next/runtime deps stay; smaller image).
 && npm prune --omit=dev

# Pre-bake the Whisper "small" model so the first request is fast and the
# server works offline. Adds ~0.5 GB to the image. Delete this line if you
# prefer a smaller image (the model will download on first transcription;
# with docker-compose it is cached in a volume either way).
RUN python -c "import whisper; whisper.load_model('small')"

ENV NODE_ENV=production
# Set to 1 ONLY when running behind a trusted reverse proxy / tunnel
# (Caddy, Nginx, Cloudflare Tunnel) so per-IP rate limiting is accurate.
ENV TRUST_PROXY=0

EXPOSE 3000
CMD ["npm", "start"]
