import dummyData from "../data/dummy-checkins.json"
import type { Granularity, AgeGroupFilter, RangePreset } from "../hooks/useCheckinStats"
import { getRangeFromPreset } from "../hooks/useCheckinStats"

export type DummyDataset = "dummy1" | "dummy2" | "dummy3"

interface RawRow {
  age_group: string
  created_at: string
}

function bucketKey(iso: string, granularity: Granularity): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()
  const h = d.getHours()

  switch (granularity) {
    case "hour":
      return new Date(y, m, day, h).toISOString()
    case "day":
      return new Date(y, m, day).toISOString()
    case "week": {
      const date = new Date(y, m, day)
      const dow = date.getDay()
      date.setDate(date.getDate() - dow)
      return date.toISOString()
    }
    case "month":
      return new Date(y, m, 1).toISOString()
    case "year":
      return new Date(y, 0, 1).toISOString()
  }
}

export function queryDummyStats(
  dataset: DummyDataset,
  granularity: Granularity,
  ageGroup: AgeGroupFilter,
  rangePreset: RangePreset,
): { period: string; count: number }[] {
  const rows = (dummyData as Record<string, RawRow[]>)[dataset] ?? []
  const { start, end } = getRangeFromPreset(rangePreset)

  const buckets = new Map<string, number>()

  for (const row of rows) {
    if (ageGroup !== "all" && row.age_group !== ageGroup) continue
    if (start && row.created_at < start) continue
    if (end && row.created_at > end) continue

    const key = bucketKey(row.created_at, granularity)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, count }))
}

export function queryDummyStatsBreakdown(
  dataset: DummyDataset,
  granularity: Granularity,
  rangePreset: RangePreset,
): { period: string; adult: number; teen: number; child: number }[] {
  const rows = (dummyData as Record<string, RawRow[]>)[dataset] ?? []
  const { start, end } = getRangeFromPreset(rangePreset)

  const buckets = new Map<string, { adult: number; teen: number; child: number }>()

  for (const row of rows) {
    if (start && row.created_at < start) continue
    if (end && row.created_at > end) continue

    const key = bucketKey(row.created_at, granularity)
    const bucket = buckets.get(key) ?? { adult: 0, teen: 0, child: 0 }
    const group = row.age_group as "adult" | "teen" | "child"
    bucket[group] += 1
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, counts]) => ({ period, ...counts }))
}
