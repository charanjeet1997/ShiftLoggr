import { useEffect } from 'react'
import type { Area, Permission } from '../types'
import { useAuthStore } from '../store/authStore'
import { useRolesStore } from '../store/rolesStore'
import { BUILTIN_ROLES } from '../constants/permissions'

// Resolves the signed-in user's role → its permission set + base area.
// Drives permission-gated nav and routing.
export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const roles = useRolesStore((s) => s.roles)
  const loaded = useRolesStore((s) => s.loaded)
  const load = useRolesStore((s) => s.load)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  const roleDef =
    roles.find((r) => r.key === user?.role) ??
    BUILTIN_ROLES.find((r) => r.key === user?.role) ??
    null

  const permissions: Permission[] = roleDef?.permissions ?? []
  const area: Area = roleDef?.area ?? 'employee'

  return {
    permissions,
    area,
    loaded,
    has: (p: Permission) => permissions.includes(p),
  }
}
