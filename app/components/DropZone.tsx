import { useRef, useState, useCallback } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const ACCEPTED_FORMATS =
  ".ogg,.mp3,.wav,.m4a,.flac,.webm,.aac,.wma,.opus,audio/*";

function UploadIcon() {
  return (
    <svg
      className="w-10 h-10 mx-auto mb-4 opacity-25 transition-opacity duration-300 group-hover:opacity-50"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 32V12M24 12l-8 8M24 12l8 8" />
      <path d="M8 36h32" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

export function DropZone({ onFileSelect, selectedFile }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className={`group relative flex-1 min-h-0 flex flex-col items-center justify-center border border-dashed rounded-sm px-8 text-center cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] bg-surface mb-4
        before:content-[''] before:absolute before:inset-[-1px] before:rounded-sm before:bg-gradient-to-br before:from-amber-glow before:to-transparent before:opacity-0 before:transition-opacity before:duration-400 before:pointer-events-none
        hover:before:opacity-100 hover:border-amber hover:bg-surface-raised
        ${isDragOver ? "border-amber bg-surface-raised scale-[1.005] before:opacity-100" : "border-border"}
        ${selectedFile ? "border-green border-solid" : ""}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <UploadIcon />
      <div className="text-[13px] text-text-dim mb-2 tracking-[0.03em]">
        Drop audio file here or click to browse
      </div>
      <div className="text-[10px] text-text-muted tracking-[0.06em] uppercase">
        ogg / mp3 / wav / m4a / flac / webm / aac &mdash; max 25 mb
      </div>
      {selectedFile && (
        <div className="text-xs text-green mt-3 tracking-[0.03em]">
          {selectedFile.name} ({formatFileSize(selectedFile.size)} MB)
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
