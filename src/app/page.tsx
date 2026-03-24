"use client"
import { useState } from "react"
import Dropzone from "@/components/scanner/Dropzone"
import ScannerView from "@/components/scanner/ScannerView"
import ResultView from "@/components/scanner/ResultView"
import LoadingModal from "@/components/ui/LoadingModal"
import { useOpenCV } from "@/hooks/useOpenCV"
import { Corner } from "@/lib/cv-pipeline"

type AppStage = "upload" | "scan" | "result"

function getLoadingMessage(stage: AppStage, isReady: boolean): string {
  if (!isReady) return "Initializing..."
  if (stage === "scan") return "Detecting document edges..."
  if (stage === "result") return "Applying perspective correction..."
  return ""
}

export default function Home() {
  const { isReady } = useOpenCV()
  const [preview, setPreview] = useState<string | null>(null)
  const [stage, setStage] = useState<AppStage>("upload")
  const [corners, setCorners] = useState<Corner[] | null>(null)
  const [loading, setLoading] = useState(false)

  const isLoading = !isReady || loading
  const loadingMessage = !isReady
    ? "Initializing..."
    : getLoadingMessage(stage, isReady)

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setCorners(null)
    setStage("upload")
  }

  const handleImageLoaded = (_: File, url: string) => {
    setPreview(url)
    setStage("scan")
    setLoading(true)
  }

  const handleDetectionDone = () => {
    setLoading(false)
  }

  const handleContinue = (detectedCorners: Corner[]) => {
    setCorners(detectedCorners)
    setStage("result")
    setLoading(true)
  }

  const handleWarpDone = () => {
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {stage === "upload" && (
          <Dropzone
            onImageLoaded={handleImageLoaded}
          />
        )}
        {stage === "scan" && preview && (
          <ScannerView
            previewUrl={preview}
            onReset={handleReset}
            onContinue={handleContinue}
            onDetectionDone={handleDetectionDone}
          />
        )}
        {stage === "result" && preview && corners && (
          <ResultView
            previewUrl={preview}
            corners={corners}
            onReset={handleReset}
            onWarpDone={handleWarpDone}
          />
        )}
      </div>

      <LoadingModal visible={isLoading} message={loadingMessage} />
    </main>
  )
}