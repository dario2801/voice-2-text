import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import type {
  TranscriptionResult,
  ApiError,
  OutputMode,
  TranscriptionEngine,
} from "../../lib/types";
import { labelForLanguage } from "../../lib/languages";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
import { acquireSlot } from "../../lib/concurrency";

// --- Configuration -------------------------------------------------------

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB of actual audio bytes
// Allow some multipart overhead (boundaries, the `mode` field, headers) on top
// of the raw file when bounding the whole request body.
const MAX_BODY_SIZE = MAX_FILE_SIZE + 1 * 1024 * 1024;

const MAX_DURATION_SEC = intFromEnv("TRANSCRIBE_MAX_DURATION_SEC", 600);
const WHISPER_TIMEOUT_MS = intFromEnv("TRANSCRIBE_TIMEOUT_MS", 300_000);
const FFPROBE_TIMEOUT_MS = intFromEnv("FFPROBE_TIMEOUT_MS", 15_000);
const SUBPROCESS_MAX_BUFFER = 16 * 1024 * 1024;

const UPLOAD_DIR = join(tmpdir(), "voz-text-uploads");

const ALLOWED_EXTENSIONS = new Set([
  "ogg", "mp3", "wav", "m4a", "flac", "webm", "aac", "wma", "opus",
]);

const MAGIC_CHECKS = [
  { offset: 0, bytes: Buffer.from("OggS") },
  { offset: 0, bytes: Buffer.from("fLaC") },
  { offset: 0, bytes: Buffer.from("ID3") },
  { offset: 0, bytes: Buffer.from([0xff, 0xfb]) },
  { offset: 0, bytes: Buffer.from([0xff, 0xf3]) },
  { offset: 0, bytes: Buffer.from([0xff, 0xf2]) },
  { offset: 0, bytes: Buffer.from("RIFF") },
  { offset: 4, bytes: Buffer.from("ftyp") },
  { offset: 0, bytes: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]) },
  { offset: 0, bytes: Buffer.from([0x30, 0x26]) },
];

// --- Helpers -------------------------------------------------------------

function hasValidMagicBytes(buffer: Buffer): boolean {
  return MAGIC_CHECKS.some(({ offset, bytes }) => {
    if (buffer.length < offset + bytes.length) return false;
    return buffer.subarray(offset, offset + bytes.length).equals(bytes);
  });
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

async function cleanup(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // ignore — best effort
  }
}

function fail(error: string, code: string, status: number, retryAfter?: number) {
  const body: ApiError = { error, code };
  const headers: Record<string, string> = {};
  if (retryAfter != null) headers["Retry-After"] = String(retryAfter);
  return NextResponse.json(body, { status, headers });
}

/**
 * Read the request body with a hard cap, aborting as soon as the cumulative
 * size exceeds the limit. This bounds in-memory usage even for chunked
 * uploads or a lying / missing Content-Length (a Route Handler cannot
 * configure a body size limit, and `serverActions.bodySizeLimit` does NOT
 * apply here). Returns null when the cap is exceeded. OWASP A04.
 */
async function readBodyCapped(
  body: ReadableStream<Uint8Array> | null,
  limit: number
): Promise<Buffer | null> {
  if (!body) return Buffer.alloc(0);
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > limit) {
          await reader.cancel().catch(() => {});
          return null;
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

function runFfprobe(
  filePath: string
): Promise<{ hasAudio: boolean; duration: number }> {
  return new Promise((resolve, reject) => {
    execFile(
      "ffprobe",
      [
        "-v", "error",
        "-show_entries", "stream=codec_type:format=duration",
        "-of", "json",
        filePath,
      ],
      { timeout: FFPROBE_TIMEOUT_MS, maxBuffer: 1024 * 1024, killSignal: "SIGKILL" },
      (error, stdout) => {
        if (error) {
          reject(new Error("ffprobe failed"));
          return;
        }
        try {
          const parsed = JSON.parse(stdout);
          const streams: Array<{ codec_type?: string }> = parsed.streams ?? [];
          const hasAudio = streams.some((s) => s.codec_type === "audio");
          const duration = Number.parseFloat(parsed.format?.duration ?? "");
          resolve({ hasAudio, duration });
        } catch {
          reject(new Error("ffprobe parse error"));
        }
      }
    );
  });
}

function runWhisper(
  filePath: string,
  task: "transcribe" | "translate"
): Promise<{ text: string; language: string }> {
  // `task` is validated against a fixed allowlist before reaching here, and
  // execFile passes args without a shell, so there is no injection surface.
  const pythonScript = `
import sys, json, whisper, warnings
warnings.filterwarnings("ignore")
model = whisper.load_model("small")
result = model.transcribe(sys.argv[1], task=sys.argv[2])
print(json.dumps({"text": result["text"].strip(), "language": result.get("language", "unknown")}))
`;

  return new Promise((resolve, reject) => {
    execFile(
      "python",
      ["-c", pythonScript, filePath, task],
      {
        timeout: WHISPER_TIMEOUT_MS,
        maxBuffer: SUBPROCESS_MAX_BUFFER,
        killSignal: "SIGKILL",
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Whisper error:", stderr || error.message);
          reject(new Error("Transcription failed. Please try again."));
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          console.error("Whisper parse error. stdout:", stdout);
          reject(new Error("Failed to parse transcription result."));
        }
      }
    );
  });
}

// --- Route ---------------------------------------------------------------
// Only POST is exported, so every other method returns 405 automatically.

export async function POST(request: NextRequest) {
  // 1. Rate-limit by client IP before doing any work. (OWASP A04)
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return fail(
      "Too many requests. Please slow down.",
      "RATE_LIMITED",
      429,
      rl.retryAfterSec
    );
  }

  // 2. Require a multipart body and reject oversized uploads early via
  //    Content-Length, before reading anything. (OWASP A04)
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return fail("Expected multipart/form-data.", "BAD_REQUEST", 400);
  }
  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "",
    10
  );
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
    return fail("File too large. Max 25 MB.", "PAYLOAD_TOO_LARGE", 413);
  }

  // 3. Hard streaming cap (covers chunked / missing / lying Content-Length).
  const rawBody = await readBodyCapped(request.body, MAX_BODY_SIZE);
  if (rawBody === null) {
    return fail("File too large. Max 25 MB.", "PAYLOAD_TOO_LARGE", 413);
  }

  // 4. Parse the (now size-bounded) multipart payload with the built-in
  //    parser by re-wrapping the captured bytes.
  let form: FormData;
  try {
    // Cast: a Node Buffer is a valid request body at runtime (undici), but
    // the DOM lib's BodyInit type doesn't model Buffer's ArrayBufferLike.
    form = await new Response(rawBody as unknown as BodyInit, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return fail("Malformed form data.", "BAD_REQUEST", 400);
  }

  const file = form.get("audio");
  if (!file || !(file instanceof Blob)) {
    return fail("No audio file provided.", "BAD_REQUEST", 400);
  }

  // Validate the output mode against a fixed allowlist (never trust client).
  const rawMode = form.get("mode");
  const mode: OutputMode =
    rawMode === "original" ? "original" : "english"; // default: english

  // 5. Extension allowlist. (OWASP A03/A04)
  const fileName = (file as File).name || "unknown";
  const ext = getExtension(fileName);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return fail(
      `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].sort().join(", ")}`,
      "INVALID_TYPE",
      400
    );
  }

  // 6. Materialize the buffer (already bounded by the streaming cap) and
  //    enforce the exact file-size limit.
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_FILE_SIZE) {
    return fail("File too large. Max 25 MB.", "PAYLOAD_TOO_LARGE", 413);
  }

  // 7. Magic-byte check on the in-memory buffer BEFORE touching disk, so a
  //    masqueraded file never gets written. (OWASP A03/A04)
  if (!hasValidMagicBytes(buffer.subarray(0, 12))) {
    return fail(
      "File content does not appear to be valid audio.",
      "INVALID_AUDIO",
      400
    );
  }

  // 8. Write to an OS temp dir (never inside the served app tree), with a
  //    random filename (no path traversal). (OWASP A01/A05)
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = join(UPLOAD_DIR, `${randomUUID()}.${ext}`);
  await writeFile(filePath, buffer);

  let slotRelease: (() => void) | null = null;
  try {
    // 9. ffprobe content + duration validation. Magic bytes are spoofable;
    //    this confirms the bytes actually demux as audio and bounds Whisper
    //    cost. (OWASP A03/A04)
    let probe: { hasAudio: boolean; duration: number };
    try {
      probe = await runFfprobe(filePath);
    } catch {
      return fail(
        "File content does not appear to be valid audio.",
        "INVALID_AUDIO",
        400
      );
    }
    if (!probe.hasAudio) {
      return fail(
        "File content does not appear to be valid audio.",
        "INVALID_AUDIO",
        400
      );
    }
    if (
      !Number.isFinite(probe.duration) ||
      probe.duration <= 0 ||
      probe.duration > MAX_DURATION_SEC
    ) {
      return fail(
        `Audio too long. Max ${Math.floor(MAX_DURATION_SEC / 60)} minutes.`,
        "AUDIO_TOO_LONG",
        400
      );
    }

    // 10. Acquire a concurrency slot right before the heavy Whisper step.
    //     Queue full -> 503 so requests fail fast instead of OOMing. (A04)
    const slot = await acquireSlot();
    if (!slot.ok) {
      return fail(
        "Server busy. Please try again shortly.",
        "BUSY",
        503,
        15
      );
    }
    slotRelease = slot.release;

    // 11. Run Whisper. mode=english -> translate (English only, Whisper's
    //     native path). mode=original -> transcribe (source language).
    const task = mode === "english" ? "translate" : "transcribe";
    let whisper: { text: string; language: string };
    try {
      whisper = await runWhisper(filePath, task);
    } catch (err) {
      console.error("Transcription failure:", (err as Error).message);
      return fail(
        "Transcription failed. Please try again.",
        "TRANSCRIBE_FAILED",
        500
      );
    }

    const sourceLang = whisper.language || "unknown";
    const outLang = mode === "english" ? "en" : sourceLang;
    const engine: TranscriptionEngine =
      mode === "english" ? "whisper-translate" : "whisper-transcribe";

    const result: TranscriptionResult = {
      sourceLang,
      sourceLangLabel: labelForLanguage(sourceLang),
      outputs: [
        {
          lang: outLang,
          label: labelForLanguage(outLang),
          text: whisper.text,
          kind: mode,
        },
      ],
      engine,
      durationSec: Math.round(probe.duration),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Transcribe endpoint error:", err);
    return fail("Internal server error.", "INTERNAL", 500);
  } finally {
    // 12. Single cleanup path: always remove the temp file and release the
    //     concurrency slot, on every outcome. (OWASP A04/A05)
    if (slotRelease) slotRelease();
    await cleanup(filePath);
  }
}
