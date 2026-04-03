import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { readSync, openSync, closeSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { execFile } from "child_process";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_EXTENSIONS = new Set([
  "ogg", "mp3", "wav", "m4a", "flac", "webm", "aac", "wma", "opus",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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
    // ignore
  }
}

function runWhisper(filePath: string): Promise<{ text: string; language: string }> {
  const pythonScript = `
import sys, json, whisper, warnings
warnings.filterwarnings("ignore")
model = whisper.load_model("small")
result = model.transcribe(sys.argv[1], task="translate")
print(json.dumps({"text": result["text"].strip(), "language": result.get("language", "unknown")}))
`;

  return new Promise((resolve, reject) => {
    execFile(
      "python",
      ["-c", pythonScript, filePath],
      { timeout: 300_000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Whisper error:", stderr || error.message);
          reject(new Error("Transcription failed. Please try again."));
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          console.error("Parse error. stdout:", stdout);
          reject(new Error("Failed to parse transcription result."));
        }
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    // Validate extension
    const fileName = (file as File).name || "unknown";
    const ext = getExtension(fileName);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].sort().join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 25 MB." },
        { status: 400 }
      );
    }

    // Write to disk
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = join(UPLOAD_DIR, `${randomUUID()}.${ext}`);
    await writeFile(filePath, buffer);

    // Validate magic bytes
    const header = Buffer.alloc(12);
    const fd = openSync(filePath, "r");
    readSync(fd, header, 0, 12, 0);
    closeSync(fd);

    if (!hasValidMagicBytes(header)) {
      await cleanup(filePath);
      return NextResponse.json(
        { error: "File content does not appear to be valid audio." },
        { status: 400 }
      );
    }

    // Run Whisper
    try {
      const result = await runWhisper(filePath);
      await cleanup(filePath);
      return NextResponse.json(result);
    } catch (err) {
      await cleanup(filePath);
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Transcribe endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
