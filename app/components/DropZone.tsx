import { useRef, useState, useCallback } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const ACCEPTED_FORMATS =
  ".ogg,.mp3,.wav,.m4a,.flac,.webm,.aac,.wma,.opus,audio/*";

function UploadMark() {
  return (
    <svg
      className="w-9 h-9 mb-5 opacity-30 transition-opacity duration-300 group-hover:opacity-60"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M24 32V11M24 11l-8 8M24 11l8 8" />
      <path d="M9 37h30" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

export function DropZone({ onFileSelect, selectedFile }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => fileInputRef.current?.click(), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) onFileSelect(e.dataTransfer.files[0]);
    },
    [onFileSelect]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload an audio file: drop it here, or press Enter to browse"
      className={`group relative flex-1 min-h-0 flex flex-col items-center justify-center border border-dashed rounded-sm p-10 max-sm:p-8 text-center cursor-pointer transition-all duration-300 ease-[var(--ease-out)] bg-surface
        hover:border-accent hover:bg-surface-raised
        ${isDragOver ? "border-accent bg-surface-raised scale-[1.004]" : "border-border"}
        ${selectedFile ? "!border-success border-solid" : ""}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <span className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted">
        01 &mdash; Source
      </span>

      <UploadMark />
      <div className="font-serif italic text-[26px] leading-none text-text">
        {isDragOver ? "Release to load" : "Drop your audio"}
      </div>
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-text-dim mt-3">
        or click to browse
      </div>
      <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-text-muted mt-6">
        ogg &middot; mp3 &middot; wav &middot; m4a &middot; flac &middot; webm
        &middot; aac &mdash; max 25mb
      </div>

      {selectedFile && (
        <div className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-accent">
          <span className="w-1.5 h-1.5 bg-success rounded-full" aria-hidden />
          <span className="truncate max-w-[60vw] md:max-w-[22ch]">
            {selectedFile.name}
          </span>
          <span className="text-text-dim">
            {formatFileSize(selectedFile.size)} MB
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFileSelect(e.target.files[0]);
        }}
      />
    </div>
  );
}
