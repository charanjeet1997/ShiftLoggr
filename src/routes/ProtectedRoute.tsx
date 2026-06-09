import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../types'
import { useAuth } from '../hooks/useAuth'

// Role guard. Unauthenticated → /login; wrong role → /unauthorized.
export function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
