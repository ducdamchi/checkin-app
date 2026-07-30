import { Outlet } from "react-router"
import { AppHeader } from "./AppHeader"
import { ProtectedRoute } from "./ProtectedRoute"

export function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <Outlet />
      </div>
    </ProtectedRoute>
  )
}
