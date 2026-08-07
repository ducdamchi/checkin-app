import { Outlet } from "react-router"
import { AppHeader } from "./AppHeader"
import { ProtectedRoute } from "./ProtectedRoute"

export function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950">
        <AppHeader />
        <Outlet />
      </div>
    </ProtectedRoute>
  )
}
