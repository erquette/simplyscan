"use client"
import { useState } from "react";
import Dropzone from "@/components/scanner/Dropzone";
import ScannerView from '@/components/scanner/ScannerView'
import { useOpenCV } from "@/hooks/useOpenCV";

export default function Home() {
  const { isReady, status } = useOpenCV();
  const [preview, setPreview] = useState<string | null>(null);

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {!preview ? (
          <Dropzone
            onImageLoaded={(_, previewUrl) => setPreview(previewUrl)}
          />
        ) : (
          <ScannerView
            previewUrl={preview}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}