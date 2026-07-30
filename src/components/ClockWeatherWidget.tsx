import { useState, useEffect, useMemo } from "react"
import { useWeather } from "../hooks/useWeather"

type WeatherCondition = "sunny" | "partly" | "cloudy" | "rain" | "thunder" | "snow" | "fog"

function classifyCondition(description: string): WeatherCondition {
  const d = description.toLowerCase()
  if (d.includes("thunder")) return "thunder"
  if (d.includes("snow") || d.includes("sleet") || d.includes("ice")) return "snow"
  if (d.includes("rain") || d.includes("drizzle") || d.includes("shower")) return "rain"
  if (d.includes("fog") || d.includes("mist") || d.includes("haze")) return "fog"
  if (d.includes("overcast")) return "cloudy"
  if (d.includes("cloud") || d.includes("partly") || d.includes("mostly")) return "partly"
  return "sunny"
}

function isNight(): boolean {
  const h = new Date().getHours()
  return h < 6 || h >= 20
}

function SunnyScene({ night }: { night: boolean }) {
  if (night) {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <circle cx="160" cy="30" r="14" fill="rgba(255,255,255,0.85)" />
        <circle cx="155" cy="26" r="14" fill="var(--sky-base)" />
        {[
          [30, 20], [70, 45], [120, 15], [50, 70], [160, 80],
          [90, 25], [140, 55], [25, 95], [175, 40], [100, 90],
          [60, 10], [130, 100], [15, 55], [185, 70], [80, 60],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={0.6 + (i % 3) * 0.4} fill="rgba(255,255,255,0.6)">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    )
  }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="sun-glow">
          <stop offset="0%" stopColor="rgba(255,220,100,0.5)" />
          <stop offset="100%" stopColor="rgba(255,220,100,0)" />
        </radialGradient>
      </defs>
      <circle cx="155" cy="30" r="40" fill="url(#sun-glow)">
        <animate attributeName="r" values="38;44;38" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="30" r="12" fill="rgba(255,230,120,0.9)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 155 + Math.cos(rad) * 18
        const y1 = 30 + Math.sin(rad) * 18
        const x2 = 155 + Math.cos(rad) * 24
        const y2 = 30 + Math.sin(rad) * 24
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,230,120,0.6)" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </line>
        )
      })}
    </svg>
  )
}

function CloudElement({ x, y, scale, dur }: { x: number; y: number; scale: number; dur: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.5">
      <ellipse cx="0" cy="0" rx="20" ry="8" fill="white" />
      <ellipse cx="-10" cy="-4" rx="12" ry="8" fill="white" />
      <ellipse cx="8" cy="-5" rx="14" ry="9" fill="white" />
      <animateTransform attributeName="transform" type="translate" values={`${x},${y};${x + 15},${y};${x},${y}`} dur={`${dur}s`} repeatCount="indefinite" additive="replace" />
    </g>
  )
}

function PartlyScene({ night }: { night: boolean }) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      {!night && (
        <>
          <circle cx="155" cy="28" r="10" fill="rgba(255,230,120,0.8)" />
          <circle cx="155" cy="28" r="22" fill="rgba(255,230,120,0.15)">
            <animate attributeName="r" values="20;26;20" dur="4s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {night && (
        <>
          <circle cx="160" cy="25" r="10" fill="rgba(255,255,255,0.7)" />
          <circle cx="156" cy="22" r="10" fill="var(--sky-base)" />
        </>
      )}
      <CloudElement x={40} y={35} scale={1} dur={20} />
      <CloudElement x={120} y={55} scale={0.7} dur={25} />
    </svg>
  )
}

function CloudyScene() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <CloudElement x={20} y={25} scale={1.2} dur={18} />
      <CloudElement x={90} y={40} scale={1} dur={22} />
      <CloudElement x={50} y={65} scale={0.9} dur={20} />
      <CloudElement x={140} y={30} scale={0.8} dur={24} />
      <CloudElement x={120} y={70} scale={1.1} dur={19} />
    </svg>
  )
}

function RainScene() {
  const drops = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: (i * 37 + 11) % 200,
      delay: (i * 0.17) % 1.2,
      dur: 0.6 + (i % 5) * 0.1,
      height: 6 + (i % 3) * 2,
    })),
  [])

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <CloudElement x={30} y={15} scale={1.3} dur={25} />
      <CloudElement x={110} y={10} scale={1.1} dur={22} />
      {drops.map((d, i) => (
        <line
          key={i}
          x1={d.x} y1={-10} x2={d.x - 2} y2={-10 + d.height}
          stroke="rgba(180,210,255,0.5)" strokeWidth="1" strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform" type="translate"
            values={`0,0;-8,${130}`}
            dur={`${d.dur}s`} begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </svg>
  )
}

function ThunderScene() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <CloudElement x={30} y={12} scale={1.4} dur={20} />
      <CloudElement x={110} y={8} scale={1.2} dur={18} />
      <polygon points="95,35 88,60 98,58 90,85 105,52 95,54" fill="rgba(255,230,100,0.7)">
        <animate attributeName="opacity" values="0;0;0.9;0;0;0;0.8;0;0;0" dur="4s" repeatCount="indefinite" />
      </polygon>
      {Array.from({ length: 18 }, (_, i) => (
        <line
          key={i}
          x1={(i * 41 + 7) % 200} y1={-5} x2={(i * 41 + 7) % 200 - 2} y2={3}
          stroke="rgba(180,210,255,0.4)" strokeWidth="1" strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform" type="translate"
            values={`0,0;-8,130`}
            dur={`${0.5 + (i % 4) * 0.1}s`} begin={`${(i * 0.15) % 1}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </svg>
  )
}

function SnowScene() {
  const flakes = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: (i * 43 + 9) % 200,
      delay: (i * 0.25) % 2,
      dur: 2.5 + (i % 5) * 0.5,
      r: 1 + (i % 3) * 0.5,
    })),
  [])

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      <CloudElement x={30} y={12} scale={1.2} dur={25} />
      <CloudElement x={120} y={8} scale={1} dur={22} />
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x} cy={-5} r={f.r} fill="rgba(255,255,255,0.7)">
          <animateTransform
            attributeName="transform" type="translate"
            values={`0,0;${8 - (i % 3) * 8},${135}`}
            dur={`${f.dur}s`} begin={`${f.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

function FogScene() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      {[30, 55, 80].map((y, i) => (
        <rect key={i} x="-20" y={y} width="240" height="12" rx="6" fill="rgba(255,255,255,0.2)">
          <animateTransform
            attributeName="transform" type="translate"
            values={`${-10 + i * 5},0;${10 - i * 5},0;${-10 + i * 5},0`}
            dur={`${6 + i * 2}s`}
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0.15;0.3;0.15" dur={`${5 + i}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  )
}

const SKY_COLORS: Record<WeatherCondition, { day: string; night: string }> = {
  sunny:  { day: "linear-gradient(135deg, #4A90D9 0%, #74B9FF 100%)", night: "linear-gradient(135deg, #0F1B3D 0%, #1A2955 100%)" },
  partly: { day: "linear-gradient(135deg, #5A9BD5 0%, #87CEEB 100%)", night: "linear-gradient(135deg, #141E3D 0%, #1E3050 100%)" },
  cloudy: { day: "linear-gradient(135deg, #7B8FA1 0%, #A4B5C4 100%)", night: "linear-gradient(135deg, #1A2333 0%, #2A3444 100%)" },
  rain:   { day: "linear-gradient(135deg, #4A5568 0%, #6B7B8D 100%)", night: "linear-gradient(135deg, #111820 0%, #1E2830 100%)" },
  thunder:{ day: "linear-gradient(135deg, #2D3748 0%, #4A5568 100%)", night: "linear-gradient(135deg, #0A0F18 0%, #151C28 100%)" },
  snow:   { day: "linear-gradient(135deg, #8FA4B8 0%, #B8C8D8 100%)", night: "linear-gradient(135deg, #1A2535 0%, #2A3545 100%)" },
  fog:    { day: "linear-gradient(135deg, #8899AA 0%, #AABBCC 100%)", night: "linear-gradient(135deg, #1A2230 0%, #283040 100%)" },
}

const SCENES: Record<WeatherCondition, React.FC<{ night: boolean }>> = {
  sunny: SunnyScene,
  partly: PartlyScene,
  cloudy: CloudyScene,
  rain: () => <RainScene />,
  thunder: () => <ThunderScene />,
  snow: () => <SnowScene />,
  fog: () => <FogScene />,
}

export function ClockWeatherWidget() {
  const [now, setNow] = useState(new Date())
  const { data: weather } = useWeather()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const date = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const condition = weather ? classifyCondition(weather.shortForecast) : "sunny"
  const night = isNight()
  const sky = SKY_COLORS[condition][night ? "night" : "day"]
  const Scene = SCENES[condition]

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-3 shadow-lg"
      style={{
        background: sky,
        ["--sky-base" as string]: night ? SKY_COLORS[condition].night.match(/#\w+/)?.[0] : SKY_COLORS[condition].day.match(/#\w+/)?.[0],
      }}
    >
      <Scene night={night} />
      <div className="relative z-10 text-right text-white/80">
        <div className="text-2xl font-medium text-white tabular-nums drop-shadow-sm">
          {time}
        </div>
        <div className="text-lg drop-shadow-sm">{date}</div>
        {weather && (
          <div className="text-lg drop-shadow-sm">
            {weather.temperature}°F
          </div>
        )}
      </div>
    </div>
  )
}
