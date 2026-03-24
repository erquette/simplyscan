"use client"
import { useEffect, useRef, useState } from "react"

type CameraViewProps = {
  onCapture: (file: File, previewUrl: string) => void
  onClose: () => void
}

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // rear camera
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError("Camera permission denied. Please allow camera access and try again.")
        } else {
          setError("Could not access camera. Try uploading an image instead.")
        }
      }
    }

    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      })
      const previewUrl = URL.createObjectURL(blob)
      onCapture(file, previewUrl)
    }, "image/jpeg", 0.92)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-4/3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setReady(true)}
          className="w-full h-full object-cover"
        />
        {ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[85%] border-2 border-accent/60 rounded-lg" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 px-6">
            <p className="text-xs font-mono text-red-400 text-center">{error}</p>
          </div>
        )}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        )}
      </div>

      {ready && (
        <p className="text-center text-xs font-mono text-zinc-600">
          align document within the frame
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="py-3 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={handleCapture}
          className="py-3 rounded-xl bg-accent text-zinc-950 text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Capture
        </button>
      </div>
    </div>
  )
}