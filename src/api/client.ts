// Shared api helpers for the serverless (Firebase) data layer.
import type { Area } from '../types'
import { builtInArea } from '../constants/permissions'
import { getById } from './db'

export { setSession, getSession, requireSession } from './session'

// Resolve a role key to its area (manager/employee). Reads the role doc from
// Firestore; falls back to the built-in mapping for manager/employee.
export async function areaForRole(roleKey: string): Promise<Area> {
  const role = await getById('roles', roleKey)
  return (role?.area as Area) ?? builtInArea(roleKey)
}

/** Normalise an error (Firebase or otherwise) into a message for the UI. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Something went wrong'
}
