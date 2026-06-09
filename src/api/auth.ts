import bcrypt from 'bcryptjs'
import type { AuthUser, LoginPayload, Role } from '../types'
import { create, queryBy } from './db'
import { setSession } from './session'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
  locationId?: string
}

// Firestore-only login: find the user by email, verify the bcrypt hash in the
// browser. (No backend, no JWT — the session is held client-side.)
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const [u] = await queryBy('users', [['email', '==', payload.email]])
  if (!u) throw new Error('Invalid email or password')

  const hash = (u.passwordHash as string) ?? ''
  const ok = hash
    ? bcrypt.compareSync(payload.password, hash)
    : (u.password as string) === payload.password // tolerate plaintext seeds
  if (!ok) throw new Error('Invalid email or password')

  const user: AuthUser = {
    uid: u.id,
    name: u.name as string,
    role: u.role as string,
  }
  setSession(user)
  return user
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const existing = await queryBy('users', [['email', '==', payload.email]])
  if (existing.length) throw new Error('Email already registered')

  const created = await create('users', {
    name: payload.name,
    email: payload.email,
    passwordHash: bcrypt.hashSync(payload.password, 10),
    role: payload.role,
    locationId: payload.locationId ?? '',
    createdAt: new Date().toISOString(),
  })

  const user: AuthUser = { uid: created.id, name: payload.name, role: payload.role }
  setSession(user)
  return user
}
