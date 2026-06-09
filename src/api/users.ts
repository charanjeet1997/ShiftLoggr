import type { AuthUser } from '../types'
import { getAll, remove } from './db'

// Public roster (uid, name, role) for Team view and swap-target labels.
export async function getUsers(): Promise<AuthUser[]> {
  const rows = await getAll('users')
  return rows.map((u) => ({
    uid: u.id,
    name: u.name as string,
    role: u.role as string,
  }))
}

// Delete a user account (manager action). Removes the users doc.
export async function deleteUser(uid: string): Promise<void> {
  await remove('users', uid)
}
