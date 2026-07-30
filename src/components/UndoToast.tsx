import { CircleCheckIcon } from "lucide-react"

export function UndoToast({
  label,
  durationMs,
  onUndo,
}: {
  label: string
  durationMs: number
  onUndo: () => void
}) {
  return (
    <div className="cn-toast relative flex w-[356px] items-center gap-3 overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-lg">
      <CircleCheckIcon className="size-4 shrink-0 text-green-500" />
      <span className="flex-1 text-sm">{label} checked in</span>
      <button
        onClick={onUndo}
        className="shrink-0 rounded-md border px-3 py-1 text-sm font-medium hover:bg-accent cursor-pointer"
      >
        Undo
      </button>
      <div
        className="undo-countdown absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30"
        style={{ "--undo-duration": `${durationMs}ms` } as React.CSSProperties}
      />
    </div>
  )
}
