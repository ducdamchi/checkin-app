import { useState, useRef, useEffect, useCallback } from "react"

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

export function SlideToggle({ options, value, onChange, className = "" }: SlideToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    const button = buttonRefs.current.get(value)
    const container = containerRef.current
    if (!button || !container) return
    const containerRect = container.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    setIndicatorStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    })
  }, [value])

  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  return (
    <div
      ref={containerRef}
      className={`relative flex rounded-full bg-muted p-1 ${className}`}
    >
      <div
        className="absolute top-1 bottom-1 rounded-full bg-primary shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            if (el) buttonRefs.current.set(option.value, el)
          }}
          className={`relative z-10 rounded-full px-3 py-1 text-center text-sm font-medium transition-colors duration-300 ${
            value === option.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
