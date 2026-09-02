import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart"
import { useLocalStorage } from "../hooks/useLocalStorage"
import {
  useCheckinStats,
  useCheckinStatsBreakdown,
  type Granularity,
  type AgeGroupFilter,
  type RangePreset,
  type DataSource,
} from "../hooks/useCheckinStats"

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
]

const AGE_GROUPS: { value: AgeGroupFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "adult", label: "Adult" },
  { value: "teen", label: "Teen" },
  { value: "child", label: "Child" },
]

const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
]

const DATA_SOURCES: { value: DataSource; label: string }[] = [
  { value: "live", label: "Live Data" },
  { value: "dummy1", label: "Demo: Quiet" },
  { value: "dummy2", label: "Demo: Medium" },
  { value: "dummy3", label: "Demo: Busy" },
]

const chartConfig = {
  count: {
    label: "Check-ins",
    color: "var(--htfl-green)",
  },
} satisfies ChartConfig

const chartConfigBreakdown = {
  adult: {
    label: "Adult",
    color: "var(--htfl-green)",
  },
  teen: {
    label: "Teen",
    color: "var(--htfl-indigo)",
  },
  child: {
    label: "Child",
    color: "var(--htfl-pink)",
  },
} satisfies ChartConfig

function formatPeriod(period: string, granularity: Granularity): string {
  const d = new Date(period)
  // The SQL function already converts to America/New_York, but returns
  // timestamptz so the values arrive labeled as UTC. Use timeZone: "UTC"
  // to display them as-is without a second browser timezone conversion.
  const tz = "UTC" as const
  switch (granularity) {
    case "hour":
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        timeZone: tz,
      })
    case "day":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz })
    case "week":
      return `Wk ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz })}`
    case "month":
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: tz })
    case "year":
      return d.getUTCFullYear().toString()
  }
}

export function DashboardPage() {
  const [granularity, setGranularity] = useLocalStorage<Granularity>("dashboard.granularity", "day")
  const [ageGroup, setAgeGroup] = useLocalStorage<AgeGroupFilter>("dashboard.ageGroup", "all")
  const [rangePreset, setRangePreset] = useLocalStorage<RangePreset>("dashboard.rangePreset", "30d")
  const [dataSource, setDataSource] = useLocalStorage<DataSource>("dashboard.dataSource", "live")
  const [colorByAge, setColorByAge] = useLocalStorage("dashboard.colorByAge", true)
  const [customStart, setCustomStart] = useLocalStorage("dashboard.customStart", "")
  const [customEnd, setCustomEnd] = useLocalStorage("dashboard.customEnd", "")

  const customRange = rangePreset === "custom" && customStart && customEnd
    ? {
        start: new Date(customStart).toISOString(),
        end: new Date(customEnd + "T23:59:59").toISOString(),
      }
    : undefined

  const { data, isLoading, error } = useCheckinStats(
    granularity,
    ageGroup,
    rangePreset,
    dataSource,
    customRange,
  )

  const {
    data: breakdownData,
    isLoading: breakdownLoading,
    error: breakdownError,
  } = useCheckinStatsBreakdown(granularity, rangePreset, dataSource, customRange)

  const chartData = (data ?? []).map((row) => ({
    period: formatPeriod(row.period, granularity),
    count: row.count,
    raw: row.period,
  }))

  const breakdownChartData = (breakdownData ?? []).map((row) => ({
    period: formatPeriod(row.period, granularity),
    adult: ageGroup === "all" || ageGroup === "adult" ? row.adult : 0,
    teen: ageGroup === "all" || ageGroup === "teen" ? row.teen : 0,
    child: ageGroup === "all" || ageGroup === "child" ? row.child : 0,
    raw: row.period,
  }))

  const activeData = colorByAge ? breakdownChartData : chartData
  const activeLoading = colorByAge ? breakdownLoading : isLoading
  const activeError = colorByAge ? breakdownError : error

  const total = colorByAge
    ? breakdownChartData.reduce(
        (sum, row) => sum + row.adult + row.teen + row.child,
        0,
      )
    : chartData.reduce((sum, row) => sum + row.count, 0)

  return (
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6 overflow-auto">
        <div className="flex flex-col gap-6 justify-center">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-light text-muted-foreground">
                Granularity
              </label>
              <Select
                value={granularity}
                onValueChange={(v) => setGranularity(v as Granularity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITIES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-light text-muted-foreground">
                Age Group
              </label>
              <Select
                value={ageGroup}
                onValueChange={(v) => setAgeGroup(v as AgeGroupFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-light text-muted-foreground">
                Time Range
              </label>
              <Select
                value={rangePreset}
                onValueChange={(v) => setRangePreset(v as RangePreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGE_PRESETS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rangePreset === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-light text-muted-foreground">
                    From
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-light text-muted-foreground">
                    To
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-light text-muted-foreground">
                Data Source
              </label>
              <Select
                value={dataSource}
                onValueChange={(v) => setDataSource(v as DataSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex w-full justify-between">
            <div className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm text-muted-foreground">
                Color by age group
              </span>
              <input
                type="checkbox"
                checked={colorByAge}
                onChange={(e) => setColorByAge(e.target.checked)}
                className="accent-[var(--htfl-green)] h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        {activeError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {activeError.message}
          </div>
        ) : activeLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : activeData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No check-ins for this period
          </div>
        ) : colorByAge ? (
          <div className="w-full max-w-full">
            <ChartContainer
              config={chartConfigBreakdown}
              className="min-h-64 max-h-80 w-full">
              <BarChart data={breakdownChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="child"
                  fill="var(--color-child)"
                  stackId="age"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="teen"
                  fill="var(--color-teen)"
                  stackId="age"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="adult"
                  fill="var(--color-adult)"
                  stackId="age"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="w-full max-w-full">
            <ChartContainer config={chartConfig} className="min-h-64 max-h-80 w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {/* Data table */}
        {activeData.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  {colorByAge ? (
                    <>
                      <TableHead className="text-right">Adult</TableHead>
                      <TableHead className="text-right">Teen</TableHead>
                      <TableHead className="text-right">Child</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right">Count</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorByAge
                  ? breakdownChartData.map((row) => (
                      <TableRow key={row.raw}>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="text-right font-mono">
                          {row.adult}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.teen}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.child}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {row.adult + row.teen + row.child}
                        </TableCell>
                      </TableRow>
                    ))
                  : chartData.map((row) => (
                      <TableRow key={row.raw}>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="text-right font-mono">
                          {row.count}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
  )
}
