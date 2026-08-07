import { useState, useEffect } from "react"

interface SlideToggleOption {
  label: string
  value: string
}

interface SlideToggleProps {
  options: SlideToggleOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SlideToggle({
  options,
  value,
  onChange,
  className = "",
}: SlideToggleProps) {
  const urlIndex = options.findIndex((o) => o.value === value)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (pendingIndex !== null && pendingIndex === urlIndex)
      setPendingIndex(null)
  }, [urlIndex, pendingIndex])

  const activeIndex = pendingIndex ?? urlIndex
  const count = options.length

  return (
    <div className={`rounded-full bg-background ${className}`}>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        <div
          className="absolute -inset-y-0.5 rounded-full bg-primary shadow-sm transition-[left] duration-300 ease-in-out"
          style={{
            width: `calc(100% / ${count})`,
            left: `calc(${activeIndex >= 0 ? activeIndex : 0} * 100% / ${count})`,
          }}
        />
        {options.map((option, idx) => (
          <button
            key={option.value}
            className={`relative z-10 rounded-full px-3 py-1 text-center text-sm font-medium transition-colors duration-100 ease-in ${
              activeIndex === idx
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setPendingIndex(idx)
              onChange(option.value)
            }}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
