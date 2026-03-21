"use client"
import { useState } from "react"
import Dropzone from "@/components/scanner/Dropzone"

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Dropzone onImageLoaded={(_, previewUrl) => setPreview(previewUrl)} />
        {preview && (
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <img src={preview} alt="Preview" className="w-full object-contain max-h-72" />
          </div>
        )}
      </div>
    </main>
  )
}