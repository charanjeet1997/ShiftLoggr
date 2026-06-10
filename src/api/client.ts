// Shared api helpers for the serverless (Firebase) data layer.
import type { Permission } from '../types'
import { BUILTIN_ROLES } from '../constants/permissions'
import { getById } from './db'

export { setSession, getSession, requireSession } from './session'

// Resolve a role key to its permission set (Firestore role doc, falling back to
// the built-in roles). Used by the data layer to scope queries.
export async function permissionsForRole(roleKey: string): Promise<Permission[]> {
  const role = await getById('roles', roleKey)
  if (role?.permissions) return role.permissions as Permission[]
  return BUILTIN_ROLES.find((r) => r.key === roleKey)?.permissions ?? []
}

export async function roleHasPermission(
  roleKey: string,
  permission: Permission,
): Promise<boolean> {
  return (await permissionsForRole(roleKey)).includes(permission)
}

/** Normalise an error (Firebase or otherwise) into a message for the UI. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Something went wrong'
}
