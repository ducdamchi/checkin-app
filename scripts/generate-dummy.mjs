/**
 * Generates dummy check-in data and writes it to src/data/dummy-checkins.json.
 * Adapted from checkin app/scripts/seed-dummy.ts — runs standalone with Node, no deps.
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "src", "data", "dummy-checkins.json")

const TZ = "America/New_York"
const DAY_MS = 24 * 60 * 60 * 1000

const PROFILES = {
  dummy1: { monthsBack: 6, baseDaily: 12, baseAge: { adult: 5, teen: 2, child: 2 } },
  dummy2: { monthsBack: 12, baseDaily: 26, baseAge: { adult: 3, teen: 4, child: 3 } },
  dummy3: { monthsBack: 18, baseDaily: 45, baseAge: { adult: 2, teen: 5, child: 4 } },
}

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18]

function rand(min, max) { return min + Math.random() * (max - min) }
function randInt(min, max) { return Math.floor(rand(min, max + 1)) }

function pick(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [v, w] of entries) { r -= w; if (r <= 0) return v }
  return entries[entries.length - 1][0]
}

function nyOffsetMs(utcMillis) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
  const map = {}
  for (const p of dtf.formatToParts(new Date(utcMillis))) {
    if (p.type !== "literal") map[p.type] = Number(p.value)
  }
  const asUTC = Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second)
  return asUTC - utcMillis
}

function nyLocalToDate(y, m, d, h, min, s) {
  const guess = Date.UTC(y, m - 1, d, h, min, s)
  return new Date(guess - nyOffsetMs(guess))
}

function nyDateParts(d) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  })
  const map = {}
  for (const p of dtf.formatToParts(d)) {
    if (p.type !== "literal") map[p.type] = Number(p.value)
  }
  return { y: map.year, m: map.month, d: map.day }
}

function isChristmasBreak(m, d) { return (m === 12 && d >= 24) || (m === 1 && d <= 1) }
function isThanksgivingWeek(m, d) { return m === 11 && d >= 22 && d <= 28 }
function isSummerBreak(m, d) { return (m === 6 && d >= 15) || m === 7 || m === 8 }

function hourWeights(schoolYearWeekday, summerWeekday, weekend) {
  if (weekend) {
    const w = [0.7, 1.2, 1.4, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7]
    return HOURS.map((h, i) => [h, w[i]])
  }
  if (summerWeekday) {
    const w = [0.8, 1.2, 1.3, 1.3, 1.2, 1.0, 0.9, 0.8, 0.6]
    return HOURS.map((h, i) => [h, w[i]])
  }
  if (schoolYearWeekday) {
    const w = [0.4, 0.5, 0.6, 0.6, 0.8, 1.4, 1.8, 1.7, 1.2]
    return HOURS.map((h, i) => [h, w[i]])
  }
  const w = [0.6, 0.8, 1.0, 1.0, 1.0, 1.0, 0.9, 0.8, 0.6]
  return HOURS.map((h, i) => [h, w[i]])
}

function ageWeights(base, hour, summer, weekend) {
  let { adult, teen, child } = base
  if (weekend) { adult *= 1.3; child *= 1.4; teen *= 0.9 }
  else if (summer) { if (hour <= 15) child *= 1.8; teen *= 0.5 }
  else { if (hour >= 15) { teen *= 2.2; child *= 1.6 } }
  return [["adult", adult], ["teen", teen], ["child", child]]
}

function generateDataset(name, profile) {
  const now = new Date()
  const start = new Date(now)
  start.setMonth(start.getMonth() - profile.monthsBack)

  const rows = []
  const totalDays = Math.ceil((now.getTime() - start.getTime()) / DAY_MS)

  for (let i = 0; i < totalDays; i++) {
    const instant = new Date(start.getTime() + i * DAY_MS + 12 * 60 * 60 * 1000)
    const { y, m, d } = nyDateParts(instant)
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()

    if (weekday === 1) continue
    if (isChristmasBreak(m, d)) continue
    if (Math.random() < 0.02) continue

    const weekend = weekday === 0 || weekday === 6
    const summer = isSummerBreak(m, d)
    const schoolYearWeekday = !weekend && !summer
    const summerWeekday = !weekend && summer

    let dayMult = 1
    if (weekend) dayMult *= 1.2
    if (summerWeekday) dayMult *= 0.85
    if (isThanksgivingWeek(m, d)) dayMult *= 0.6

    const total = Math.max(0, Math.round(profile.baseDaily * dayMult * rand(0.8, 1.2)))
    const hw = hourWeights(schoolYearWeekday, summerWeekday, weekend)

    for (let k = 0; k < total; k++) {
      const hour = pick(hw)
      const age = pick(ageWeights(profile.baseAge, hour, summer, weekend))
      const created_at = nyLocalToDate(y, m, d, hour, randInt(0, 59), randInt(0, 59))
      rows.push({ age_group: age, created_at: created_at.toISOString() })
    }
  }

  rows.sort((a, b) => a.created_at.localeCompare(b.created_at))
  return rows
}

// Generate all datasets
const result = {}
for (const [name, profile] of Object.entries(PROFILES)) {
  result[name] = generateDataset(name, profile)
  console.log(`${name}: ${result[name].length} rows`)
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(result))
console.log(`Wrote ${OUT}`)
