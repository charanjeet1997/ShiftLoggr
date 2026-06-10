import type { Shift } from '../types'
import { roleHasPermission } from './client'
import { create, getAll, queryBy, remove, update, type Raw } from './db'
import { requireSession } from './session'

export type NewShift = Omit<Shift, 'shiftId' | 'createdAt' | 'status'> &
  Partial<Pick<Shift, 'status'>>

function toShift(d: Raw): Shift {
  return {
    shiftId: d.id,
    userId: d.userId as string,
    locationId: d.locationId as string,
    startTime: d.startTime as string,
    endTime: d.endTime as string,
    role: d.role as string,
    status: d.status as Shift['status'],
    repeat: d.repeat as Shift['repeat'],
    createdAt: d.createdAt as string,
  }
}

// Users who can manage shifts see all of them; everyone else only their own.
export async function getShifts(): Promise<Shift[]> {
  const me = requireSession()
  const all = await roleHasPermission(me.role, 'manage_shifts')
  const rows = all
    ? await getAll('shifts')
    : await queryBy('shifts', [['userId', '==', me.uid]])
  return rows.map(toShift)
}

// Other employees' upcoming shifts — candidates to swap onto.
export async function getSwappableShifts(): Promise<Shift[]> {
  const me = requireSession()
  const rows = await queryBy('shifts', [['status', '==', 'scheduled']])
  return rows.filter((s) => s.userId !== me.uid).map(toShift)
}

export async function createShift(payload: NewShift): Promise<Shift> {
  const created = await create('shifts', {
    ...payload,
    status: payload.status ?? 'scheduled',
    createdAt: new Date().toISOString(),
  })
  return toShift(created)
}

export async function updateShift(
  id: string,
  patch: Partial<Shift>,
): Promise<Shift> {
  const { shiftId: _omit, ...rest } = patch
  void _omit
  const updated = await update('shifts', id, rest)
  return toShift(updated!)
}

export async function deleteShift(id: string): Promise<void> {
  await remove('shifts', id)
}
