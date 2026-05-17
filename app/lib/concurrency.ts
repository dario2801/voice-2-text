// In-process concurrency limiter for the transcription pipeline.
//
// Whisper "small" is RAM/CPU heavy; unbounded concurrent subprocesses would
// OOM/DoS the box. This caps how many transcriptions run at once and bounds
// the wait queue so excess requests fail fast with 503 instead of piling up.
//
// NOTE: state is per Node process. This is correct only on a single
// long-lived instance (the confirmed deploy model: VPS/Docker, not
// serverless). It resets on redeploy. OWASP A04 (Insecure Design / resource
// exhaustion).

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MAX_CONCURRENCY = intFromEnv("TRANSCRIBE_MAX_CONCURRENCY", 1);
const MAX_QUEUE = intFromEnv("TRANSCRIBE_MAX_QUEUE", 4);

let active = 0;
const waiters: Array<() => void> = [];

export type SlotResult =
  | { ok: true; release: () => void }
  | { ok: false };

/**
 * Try to acquire an execution slot.
 * - Free slot available -> resolves immediately with a one-shot `release()`.
 * - All slots busy but queue has room -> waits until a slot frees.
 * - Queue full -> resolves `{ ok: false }` so the caller can return 503.
 */
export function acquireSlot(): Promise<SlotResult> {
  if (active < MAX_CONCURRENCY) {
    active++;
    return Promise.resolve({ ok: true, release: makeRelease() });
  }
  if (waiters.length >= MAX_QUEUE) {
    return Promise.resolve({ ok: false });
  }
  return new Promise<SlotResult>((resolve) => {
    waiters.push(() => resolve({ ok: true, release: makeRelease() }));
  });
}

function makeRelease(): () => void {
  let released = false;
  return () => {
    if (released) return; // guard against double-release in finally blocks
    released = true;
    const next = waiters.shift();
    if (next) {
      // Hand the slot directly to the next waiter (active count unchanged).
      next();
    } else {
      active = Math.max(0, active - 1);
    }
  };
}

export const concurrencyConfig = { MAX_CONCURRENCY, MAX_QUEUE };
