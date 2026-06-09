import type { Area, Permission, RoleDef } from '../types'
import { create, getAll, getById, queryBy, remove, update, type Raw } from './db'

export interface NewRole {
  label: string
  area: Area
  permissions: Permission[]
}

function toRole(d: Raw): RoleDef {
  return {
    key: d.id,
    label: d.label as string,
    area: d.area as Area,
    permissions: (d.permissions as Permission[]) ?? [],
    builtIn: Boolean(d.builtIn),
  }
}

export async function getRoles(): Promise<RoleDef[]> {
  return (await getAll('roles')).map(toRole)
}

function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'role'
  )
}

export async function createRole(payload: NewRole): Promise<RoleDef> {
  let key = slugify(payload.label)
  // ensure unique doc id
  while (await getById('roles', key)) key = `${key}-${Math.random().toString(36).slice(2, 5)}`
  const created = await create(
    'roles',
    {
      label: payload.label,
      area: payload.area,
      permissions: payload.permissions,
      builtIn: false,
    },
    key,
  )
  return toRole(created)
}

export async function updateRole(
  key: string,
  patch: Partial<NewRole>,
): Promise<RoleDef> {
  const existing = await getById('roles', key)
  if (!existing) throw new Error('Role not found')
  if (existing.builtIn) throw new Error('Built-in roles cannot be edited')
  const updated = await update('roles', key, { ...patch })
  return toRole(updated!)
}

export async function deleteRole(key: string): Promise<void> {
  const existing = await getById('roles', key)
  if (!existing) throw new Error('Role not found')
  if (existing.builtIn) throw new Error('Built-in roles cannot be deleted')
  const assigned = await queryBy('users', [['role', '==', key]])
  if (assigned.length) throw new Error('Role is assigned to users')
  await remove('roles', key)
}
