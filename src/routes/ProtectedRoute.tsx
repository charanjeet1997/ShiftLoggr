import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { Permission } from '../types'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { homePathForPermissions } from '../components/layout/navConfig'

// Requires a signed-in user; unauthenticated → /login.
export function RequireAuth() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// Gates a page on a single permission. Lacking it → bounce to the user's home
// (their first permitted destination).
export function Guard({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { permissions, loaded, has } = usePermissions()
  if (!loaded) return null // brief: roles still loading
  if (!has(permission)) {
    return <Navigate to={homePathForPermissions(permissions)} replace />
  }
  return <>{children}</>
}

// Sends a logged-in user to their first permitted page; otherwise to login.
export function RootRedirect() {
  const { user } = useAuth()
  const { permissions, loaded } = usePermissions()
  if (!user) return <Navigate to="/login" replace />
  if (!loaded) return null
  return <Navigate to={homePathForPermissions(permissions)} replace />
}
