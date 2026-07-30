import { useQuery } from "@tanstack/react-query"

interface WeatherData {
  temperature: number
  shortForecast: string
  icon: string
}

const LAT = import.meta.env.VITE_WEATHER_LAT
const LON = import.meta.env.VITE_WEATHER_LON

async function fetchWeather(): Promise<WeatherData | null> {
  if (!LAT || !LON) return null

  const pointsRes = await fetch(`https://api.weather.gov/points/${LAT},${LON}`, {
    headers: { "User-Agent": "HTFLCheckinApp" },
  })
  if (!pointsRes.ok) return null
  const points = await pointsRes.json()

  const stationsUrl: string = points.properties.observationStations
  const stationsRes = await fetch(stationsUrl, {
    headers: { "User-Agent": "HTFLCheckinApp" },
  })
  if (!stationsRes.ok) return null
  const stations = await stationsRes.json()

  const stationId: string = stations.features[0].properties.stationIdentifier
  const obsRes = await fetch(
    `https://api.weather.gov/stations/${stationId}/observations/latest`,
    { headers: { "User-Agent": "HTFLCheckinApp" } },
  )
  if (!obsRes.ok) return null
  const obs = await obsRes.json()

  const props = obs.properties
  const tempC = props.temperature?.value
  if (tempC == null) return null

  return {
    temperature: Math.round(tempC * 9 / 5 + 32),
    shortForecast: props.textDescription ?? "",
    icon: props.icon ?? "",
  }
}

export function useWeather() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 1,
  })
}
