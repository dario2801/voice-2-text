import { useRef, useState, useCallback } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const ACCEPTED_FORMATS = ".ogg,.mp3,.wav,.m4a,.flac,.webm,.aac,.wma,.opus,audio/*";

function UploadIcon() {
  return (
    <svg
      className="drop-icon"
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

  const className = [
    "drop-zone",
    isDragOver && "drag-over",
    selectedFile && "has-file",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <UploadIcon />
      <div className="drop-label">Drop audio file here or click to browse</div>
      <div className="drop-hint">
        ogg / mp3 / wav / m4a / flac / webm / aac &mdash; max 25 mb
      </div>
      {selectedFile && (
        <div className="file-name">
          {selectedFile.name} ({formatFileSize(selectedFile.size)} MB)
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) onFileSelect(e.target.files[0]);
        }}
      />
    </div>
  );
}
