import type { AuthUser } from '../types'

// Who is currently signed in. With Firestore-only auth there is no JWT — we keep
// the authenticated user here so the data layer can scope queries (manager vs
// own). Persisted to localStorage so a refresh keeps the session.

const KEY = 'shiftloggr.session'
let current: AuthUser | null = null

export function setSession(user: AuthUser | null): void {
  current = user
  if (user) localStorage.setItem(KEY, JSON.stringify(user))
  else localStorage.removeItem(KEY)
}

export function getSession(): AuthUser | null {
  if (current) return current
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) current = JSON.parse(raw) as AuthUser
  } catch {
    /* ignore */
  }
  return current
}

export function requireSession(): AuthUser {
  const user = getSession()
  if (!user) throw new Error('Not authenticated')
  return user
}
