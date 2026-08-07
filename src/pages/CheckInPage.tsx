import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/ui/button"
import { UndoToast } from "../components/UndoToast"
import { ClockWeatherWidget } from "../components/ClockWeatherWidget"
import { DaySchedule } from "../components/DaySchedule"

const AGE_GROUPS = [
  { value: "adult", label: "Adult +1", description: "18 or above" },
  { value: "teen", label: "Teen +1", description: "12 - 17" },
  { value: "child", label: "Child +1", description: "11 or below" },
] as const

const UNDO_DURATION_MS = 10_000

export function CheckInPage() {
  const { session } = useAuth()

  const checkin = useMutation({
    mutationFn: async (ageGroup: string) => {
      const { data, error } = await supabase
        .from("checkins")
        .insert({
          space_id: session!.user.id,
          age_group: ageGroup,
        })
        .select("id")
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data, ageGroup) => {
      const label = AGE_GROUPS.find((g) => g.value === ageGroup)!.label

      toast.custom(
        (toastId) => (
          <UndoToast
            label={label}
            durationMs={UNDO_DURATION_MS}
            onUndo={async () => {
              toast.dismiss(toastId)
              const { error } = await supabase
                .from("checkins")
                .delete()
                .eq("id", data.id)
              if (error) {
                toast.error(`Undo failed: ${error.message}`)
              } else {
                toast.info(`${label} undone`)
              }
            }}
          />
        ),
        { duration: UNDO_DURATION_MS },
      )
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return (
    <main className="flex flex-1 p-4 h-full">
      <div className="flex flex-1 h-full gap-6">
        {/* Check-in buttons */}
        <div className="flex flex-1 flex-col h-full items-center justify-center gap-6 rounded-2xl border border-border/50 shadow-lg bg-card shadow-md pb-10">
          <h1 className="text-3xl font-bold">Tap to check in</h1>
          <div className="flex gap-4">
            {AGE_GROUPS.map((group) => (
              <Button
                key={group.value}
                size="lg"
                className="h-40 w-60 text-2xl flex flex-col items-center justify-center"
                disabled={checkin.isPending}
                onClick={() => checkin.mutate(group.value)}>
                <span>{group.label}</span>
                <span className="text-base font-extralight">
                  {group.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Weather + Calendar sidebar */}
        <div className="flex flex-col gap-3 w-72 ">
          <div className="shrink-0">
            <ClockWeatherWidget />
          </div>
          <div className="flex-1 min-h-0">
            <DaySchedule />
          </div>
        </div>
      </div>
    </main>
  )
}
