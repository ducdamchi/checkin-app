import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginPage } from './pages/LoginPage.tsx'
import { CheckInPage } from './pages/CheckInPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { AuthenticatedLayout } from './components/AuthenticatedLayout.tsx'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthenticatedLayout />,
    children: [
      { path: '/', element: <CheckInPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
