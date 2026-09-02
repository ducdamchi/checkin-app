import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"
import { queryDummyStats, queryDummyStatsBreakdown, type DummyDataset } from "../lib/dummyStats"

export type Granularity = "hour" | "day" | "week" | "month" | "year"
export type AgeGroupFilter = "all" | "adult" | "teen" | "child"
export type RangePreset = "today" | "7d" | "30d" | "year" | "all" | "custom"
export type DataSource = "live" | DummyDataset

export function getRangeFromPreset(preset: RangePreset): { start: string | null; end: string | null } {
  if (preset === "all") return { start: null, end: null }

  const now = new Date()
  const end = now.toISOString()

  if (preset === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return { start: start.toISOString(), end }
  }
  if (preset === "7d") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { start: start.toISOString(), end }
  }
  if (preset === "30d") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { start: start.toISOString(), end }
  }
  // "year"
  const start = new Date(now.getFullYear(), 0, 1)
  return { start: start.toISOString(), end }
}

export function useCheckinStats(
  granularity: Granularity,
  ageGroup: AgeGroupFilter,
  rangePreset: RangePreset,
  dataSource: DataSource = "live",
  customRange?: { start: string; end: string },
) {
  const { start, end } = rangePreset === "custom" && customRange
    ? customRange
    : getRangeFromPreset(rangePreset)

  return useQuery({
    queryKey: ["checkin-stats", granularity, ageGroup, rangePreset, dataSource, ...(rangePreset === "custom" ? [start, end] : [])],
    queryFn: async () => {
      if (dataSource !== "live") {
        return queryDummyStats(dataSource, granularity, ageGroup, rangePreset)
      }
      const { data, error } = await supabase.rpc("get_checkin_stats", {
        p_granularity: granularity,
        p_age_group: ageGroup,
        p_range_start: start,
        p_range_end: end,
      })
      if (error) throw error
      return data as { period: string; count: number }[]
    },
  })
}

export type BreakdownRow = { period: string; adult: number; teen: number; child: number }

export function useCheckinStatsBreakdown(
  granularity: Granularity,
  rangePreset: RangePreset,
  dataSource: DataSource = "live",
  customRange?: { start: string; end: string },
) {
  const { start, end } = rangePreset === "custom" && customRange
    ? customRange
    : getRangeFromPreset(rangePreset)

  return useQuery({
    queryKey: ["checkin-stats-breakdown", granularity, rangePreset, dataSource, ...(rangePreset === "custom" ? [start, end] : [])],
    queryFn: async (): Promise<BreakdownRow[]> => {
      if (dataSource !== "live") {
        return queryDummyStatsBreakdown(dataSource, granularity, rangePreset)
      }

      const groups = ["adult", "teen", "child"] as const
      const results = await Promise.all(
        groups.map((g) =>
          supabase.rpc("get_checkin_stats", {
            p_granularity: granularity,
            p_age_group: g,
            p_range_start: start,
            p_range_end: end,
          }),
        ),
      )

      const buckets = new Map<string, { adult: number; teen: number; child: number }>()
      for (let i = 0; i < groups.length; i++) {
        const { data, error } = results[i]
        if (error) throw error
        for (const row of data as { period: string; count: number }[]) {
          const bucket = buckets.get(row.period) ?? { adult: 0, teen: 0, child: 0 }
          bucket[groups[i]] = row.count
          buckets.set(row.period, bucket)
        }
      }

      return Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, counts]) => ({ period, ...counts }))
    },
  })
}
