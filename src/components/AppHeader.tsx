import { useNavigate, useLocation } from "react-router"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../hooks/useTheme"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { SlideToggle } from "./ui/slide-toggle"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function AppHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { session } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const spaceName =
    session?.user.user_metadata?.name ??
    session?.user.email?.split("@")[0] ??
    ""

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate("/login", { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <nav className="flex gap-6 items-center">
        <img src={`${import.meta.env.BASE_URL}htfl_logo.png`} className="max-w-40" />
        <SlideToggle
          options={[
            { label: "Check In", value: "/" },
            { label: "Dashboard", value: "/dashboard" },
          ]}
          value={pathname}
          onChange={(path) => navigate(path)}
        />
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground ">
          {getGreeting()},{" "}
          <span className="capitalize font-bold">{spaceName}</span>!
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          aria-label="Toggle theme">
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="bg-[var(--htfl-indigo)] text-white">
          Sign out
        </Button>
      </div>
    </header>
  )
}
