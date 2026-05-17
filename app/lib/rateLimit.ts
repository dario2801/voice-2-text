// In-memory per-IP fixed-window rate limiter.
//
// First line of defense against flooding a public, no-auth tool. State is per
// Node process: correct only on a single long-lived instance (confirmed
// deploy model), resets on redeploy, and is bypassable via IP rotation. A
// shared store (Redis) would be the production-grade upgrade but is
// intentionally out of scope per the minimal-dependencies requirement.
// OWASP A04 (Insecure Design / resource abuse).

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RATE_LIMIT_MAX = intFromEnv("RATE_LIMIT_MAX", 5);
const RATE_LIMIT_WINDOW_MS = intFromEnv("RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000);
// Hard cap on tracked IPs so the map can't grow unbounded under attack.
const MAX_ENTRIES = intFromEnv("RATE_LIMIT_MAX_ENTRIES", 10_000);

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (only meaningful when blocked). */
  retryAfterSec: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    evictIfNeeded(now);
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count++;
  return { allowed: true, retryAfterSec: 0 };
}

function evictIfNeeded(now: number): void {
  if (buckets.size < MAX_ENTRIES) return;
  // Drop expired entries first.
  for (const [ip, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(ip);
  }
  // Still over cap -> drop the soonest-expiring entries.
  if (buckets.size >= MAX_ENTRIES) {
    const sorted = [...buckets.entries()].sort(
      (a, b) => a[1].resetAt - b[1].resetAt
    );
    const toDrop = buckets.size - MAX_ENTRIES + 1;
    for (let i = 0; i < toDrop; i++) buckets.delete(sorted[i][0]);
  }
}

/**
 * Resolve the client IP from request headers.
 *
 * `x-forwarded-for` is only trusted when TRUST_PROXY is set, because behind a
 * trusted reverse proxy that header is authoritative, but when exposed
 * directly it is fully client-controlled and trivially spoofable. Without a
 * trusted proxy we fall back to a single shared bucket key so the limiter
 * still bounds total throughput (fail-safe), and log nothing identifying.
 */
export function getClientIp(headers: Headers): string {
  const trustProxy = /^(1|true|yes)$/i.test(process.env.TRUST_PROXY ?? "");
  if (trustProxy) {
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const first = xff.split(",")[0]?.trim();
      if (first) return first;
    }
    const real = headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "shared";
}

export const rateLimitConfig = {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
};
