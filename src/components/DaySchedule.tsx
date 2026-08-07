const CALENDAR_IDS = [
  import.meta.env.VITE_CALENDER_ID_1 as string,
  import.meta.env.VITE_CALENDER_ID_2 as string,
]

export function DaySchedule() {
  const srcParams = new URLSearchParams({
    mode: "AGENDA",
    showTitle: "0",
    showNav: "0",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    bgcolor: "transparent",
  })

  // Add each calendar as a "src" param
  const baseUrl = `https://calendar.google.com/calendar/embed?${srcParams.toString()}&ctz=America/New_York`
  const calendarSrcs = CALENDAR_IDS.map(
    (id) => `&src=${encodeURIComponent(id)}`
  ).join("")

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-card/80 backdrop-blur border border-border/50 shadow-lg">
      <iframe
        src={`${baseUrl}${calendarSrcs}`}
        className="w-full h-full border-0"
        title="Makerspace Calendar"
      />
    </div>
  )
}
