"use client"
import { useEffect, useRef, useState } from "react"
import { applyPerspectiveWarp, applyFilter, FilterMode, Corner } from "@/lib/cv-pipeline"

const FILTERS: { mode: FilterMode; label: string }[] = [
  { mode: "original", label: "Original" },
  { mode: "bw",       label: "B&W" },
  { mode: "enhance",  label: "Enhance" },
]

type ResultViewProps = {
  previewUrl: string
  corners: Corner[]
  onReset: () => void
  onWarpDone: () => void
}

export default function ResultView({
  previewUrl,
  corners,
  onReset,
  onWarpDone,
}: ResultViewProps) {
  const resultCanvasRef = useRef<HTMLCanvasElement>(null)
  const warpedCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterMode>("original")
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const srcCanvas = document.createElement("canvas")
      srcCanvas.width = img.naturalWidth
      srcCanvas.height = img.naturalHeight
      srcCanvas.getContext("2d")?.drawImage(img, 0, 0)

      const warped = applyPerspectiveWarp(srcCanvas, corners)
      warpedCanvasRef.current = warped

      if (resultCanvasRef.current) {
        applyFilter(warped, "original", resultCanvasRef.current)
      }

      setProcessing(false)
      onWarpDone()
    }
    img.src = previewUrl
  }, [previewUrl, corners, onWarpDone])

    const handleFilterChange = (mode: FilterMode) => {
    if (!warpedCanvasRef.current || !resultCanvasRef.current) return
    setActiveFilter(mode)
    applyFilter(warpedCanvasRef.current, mode, resultCanvasRef.current)
  }

  const handleSave = () => {
    const canvas = resultCanvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `scanlite-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-black"
        style={{ maxHeight: "60dvh" }}
      >
        <canvas ref={resultCanvasRef} className="block w-full h-auto object-contain" />
      </div>

      <div className="flex gap-2">
        {FILTERS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleFilterChange(mode)}
            className={`
              flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-colors
              ${activeFilter === mode
                ? "bg-accent text-accent-dark"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReset}
          className="py-3 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Start Over
        </button>
        <button
          type="button"
          disabled={processing}
          onClick={handleSave}
          className="py-3 rounded-xl bg-accent text-accent-dark text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save as PNG
        </button>
      </div>
    </div>
  )
}