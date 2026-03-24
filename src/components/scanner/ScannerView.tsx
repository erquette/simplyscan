"use client"
import { useEffect, useRef, useState, useCallback } from "react"
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
  const draggingIndexRef = useRef<number>(-1)

  // convert a mouse/touch event position into canvas pixel coordinates
  // necessary as the canvas CSS size is not its actual pixel resolution
  const getCanvasPos = useCallback(
    (e: MouseEvent | TouchEvent): Corner => {
      const overlay = overlayCanvasRef.current!
      const rect = overlay.getBoundingClientRect()
      const scaleX = overlay.width / rect.width
      const scaleY = overlay.height / rect.height
      const source = "touches" in e ? e.touches[0] : e
      return {
        x: (source.clientX - rect.left) * scaleX,
        y: (source.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  // find which corner (if any) is close enough to the pointer to be grabbed
  const findNearestCorner = useCallback(
    (pos: Corner, currentCorners: Corner[]): number => {
      const overlay = overlayCanvasRef.current!
      const hitRadius = overlay.width * 0.06

      let bestIndex = -1
      let bestDistance = Infinity

      currentCorners.forEach((corner, index) => {
        const distance = Math.hypot(corner.x - pos.x, corner.y - pos.y)
        if (distance < hitRadius && distance < bestDistance) {
          bestDistance = distance
          bestIndex = index
        }
      })

      return bestIndex
    },
    []
  )

  const redrawOverlay = useCallback((updatedCorners: Corner[]) => {
    const overlay = overlayCanvasRef.current
    if (!overlay) return
    drawCornerOverlay(overlay, updatedCorners, overlay.width, overlay.height)
  }, [])

  useEffect(() => {
    const overlay = overlayCanvasRef.current
    if (!overlay || !corners) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      const pos = getCanvasPos(e)
      const index = findNearestCorner(pos, corners)
      draggingIndexRef.current = index
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (draggingIndexRef.current === -1) return

      const pos = getCanvasPos(e)
      const overlay = overlayCanvasRef.current
      if (!overlay) return

      const clamped: Corner = {
        x: Math.max(0, Math.min(pos.x, overlay.width)),
        y: Math.max(0, Math.min(pos.y, overlay.height)),
      }

      setCorners((prev) => {
        if (!prev) return prev
        const updated = prev.map((c, i) =>
          i === draggingIndexRef.current ? clamped : c
        )
        redrawOverlay(updated)
        return updated
      })
    }

    const handlePointerUp = () => {
      draggingIndexRef.current = -1
    }

    overlay.addEventListener("mousedown", handlePointerDown)
    overlay.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("mousemove", handlePointerMove)
    window.addEventListener("mouseup", handlePointerUp)

    overlay.addEventListener("touchstart", handlePointerDown, { passive: false })
    overlay.addEventListener("touchmove", handlePointerMove, { passive: false })
    overlay.addEventListener("touchend", handlePointerUp)

    return () => {
      overlay.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("mousemove", handlePointerMove)
      window.removeEventListener("mouseup", handlePointerUp)

      overlay.removeEventListener("touchstart", handlePointerDown)
      overlay.removeEventListener("touchmove", handlePointerMove)
      overlay.removeEventListener("touchend", handlePointerUp)
    }
  }, [corners, getCanvasPos, findNearestCorner, redrawOverlay])

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
      <div
        className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-black"
        style={{ maxHeight: "65dvh" }}  
      >
        <canvas
          ref={imageCanvasRef}
          className="block w-full h-auto"
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full touch-none"
        />
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