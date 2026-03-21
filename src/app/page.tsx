"use client"
import { useState } from "react";
import Dropzone from "@/components/scanner/Dropzone";
import { useOpenCV } from "@/hooks/useOpenCV";

export default function Home() {
  const { isReady, status } = useOpenCV();
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className={`
            w-2 h-2 rounded-full
            ${status === "ready" && "bg-lime-400"}
            ${status === "loading" && "bg-yellow-400 animate-pulse"}
            ${status === "error" && "bg-red-400"}
          `} />
          <span className="text-xs font-mono text-zinc-500">
            {status === "loading" && "status: initializing..."}
            {status === "ready" && "status: ready to scan"}
            {status === "error" && "error: please try again later."}
          </span>
        </div>

        <Dropzone
          onImageLoaded={(_, previewUrl) => setPreview(previewUrl)}
        />
        {preview && (
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <img src={preview} alt="Preview" className="w-full object-contain max-h-72" />
          </div>
        )}
      </div>
    </main>
  )
}