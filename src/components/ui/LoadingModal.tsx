
type LoadingModalProps = {
  visible: boolean
  message: string
}

export default function LoadingModal({ visible, message }: LoadingModalProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center gap-5 px-10 py-8 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        </div>
        <p className="text-sm font-mono text-zinc-400 tracking-wide">
          {message}
        </p>
      </div>
    </div>
  )
}