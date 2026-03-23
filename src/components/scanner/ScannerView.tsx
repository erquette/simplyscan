"use client"
import { useEffect, useRef, useState } from "react"
import { detectDocumentCorners, drawCornerOverlay, getDefaultCorners, Corner } from "@/lib/cv-pipeline"

type ScannerViewProps = {
  previewUrl: string
  onReset: () => void
  onContinue: (corners: Corner[]) => void
  onDetectionDone: () => void
}

export default function ScannerView({
  previewUrl,
  onReset,
  onContinue,
  onDetectionDone,
}: ScannerViewProps) {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [corners, setCorners] = useState<Corner[] | null>(null)
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const canvas = imageCanvasRef.current
      const overlay = overlayCanvasRef.current
      if (!canvas || !overlay) return

      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext("2d")?.drawImage(img, 0, 0)

      const found = detectDocumentCorners(canvas)
      const finalCorners = found ?? getDefaultCorners(img.naturalWidth, img.naturalHeight)

      setCorners(finalCorners)
      setDetecting(false)
      drawCornerOverlay(overlay, finalCorners, img.naturalWidth, img.naturalHeight)
      onDetectionDone()
    }
    img.src = previewUrl
  }, [previewUrl, onDetectionDone])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-black">
        <canvas ref={imageCanvasRef} className="block w-full h-auto" />
        <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReset}
          className="py-3 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={detecting}
          onClick={() => corners && onContinue(corners)}
          className="py-3 rounded-xl bg-accent text-accent-dark text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}