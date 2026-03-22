"use client"
import { useCallback, useRef, useState } from "react"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/constants"

type DropzoneProps = {
  onImageLoaded: (file: File, previewUrl: string) => void;
}

type ValidationError = string | null;

function validateFile(file: File): ValidationError {
  const acceptedTypes = Object.keys(ACCEPTED_IMAGE_TYPES);

  if (!acceptedTypes.includes(file.type)) {
    return `Unsupported file type. Please upload a JPG, PNG, or WEBP image.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
}

export default function Dropzone({ onImageLoaded }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<ValidationError>(null)

  const handleFile = useCallback((file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      onImageLoaded(file, previewUrl);
    },
    [onImageLoaded]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = () => setIsDragging(false);

  const acceptString = Object.entries(ACCEPTED_IMAGE_TYPES)
    .flatMap(([, exts]) => exts)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full rounded-2xl border-2 border-dashed px-6 py-16
          flex flex-col items-center justify-center gap-4
          transition-all duration-200 cursor-pointer outline-none
          ${isDragging
            ? "border-accent bg-accent/5"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/60"
          }
        `}
      >
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-2xl
          transition-colors duration-200
          ${isDragging ? "bg-accent/15" : "bg-zinc-800"}
        `}>
          📄
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-200">
            Drop your image here
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            or <span className="text-zinc-300 underline underline-offset-2">browse files</span>
          </p>
        </div>

        <p className="text-[11px] text-zinc-600 font-mono">
          JPG · PNG · WEBP &nbsp;·&nbsp; max {MAX_FILE_SIZE_MB}MB
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <p className="text-xs text-red-400 text-center px-2">
          {error}
        </p>
      )}
    </div>
  )
}