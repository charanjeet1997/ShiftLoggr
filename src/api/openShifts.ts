import type { OpenShiftRequest, Shift } from '../types'
import { roleHasPermission } from './client'
import {
  create,
  db,
  doc,
  getAll,
  getById,
  queryBy,
  update,
  writeBatch,
  type Raw,
} from './db'
import { requireSession } from './session'

function toRequest(d: Raw): OpenShiftRequest {
  return {
    requestId: d.id,
    shiftId: d.shiftId as string,
    userId: d.userId as string,
    status: d.status as OpenShiftRequest['status'],
    createdAt: d.createdAt as string,
    resolvedAt: (d.resolvedAt as string | null) ?? null,
  }
}

// An employee with any shift that hasn't finished yet cannot claim open
// shifts — one shift at a time.
export function hasUnfinishedShift(shifts: Shift[]): boolean {
  const now = Date.now()
  return shifts.some((s) => new Date(s.endTime).getTime() > now)
}

export async function getOpenShiftRequests(): Promise<OpenShiftRequest[]> {
  const me = requireSession()
  const all = await roleHasPermission(me.role, 'approve_swaps')
  const rows = all
    ? await getAll('openShiftRequests')
    : await queryBy('openShiftRequests', [['userId', '==', me.uid]])
  return rows.map(toRequest)
}

export async function createOpenShiftRequest(
  shiftId: string,
): Promise<OpenShiftRequest> {
  const me = requireSession()

  const shift = await getById('shifts', shiftId)
  if (!shift || shift.userId !== null)
    throw new Error('This shift is no longer open.')

  const mine = await queryBy('shifts', [['userId', '==', me.uid]])
  if (hasUnfinishedShift(mine.map((s) => ({ endTime: s.endTime }) as Shift)))
    throw new Error(
      'You already have a shift on your schedule. You can request open shifts once it has been completed.',
    )

  const pending = await queryBy('openShiftRequests', [
    ['shiftId', '==', shiftId],
    ['userId', '==', me.uid],
    ['status', '==', 'pending'],
  ])
  if (pending.length > 0)
    throw new Error('You have already requested this shift.')

  const created = await create('openShiftRequests', {
    shiftId,
    userId: me.uid,
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  })
  return toRequest(created)
}

// Atomic approval: assign the shift to the requester, approve the request,
// and auto-reject every other pending request for the same shift.
export async function approveOpenShiftRequest(
  id: string,
): Promise<OpenShiftRequest> {
  const req = await getById('openShiftRequests', id)
  if (!req) throw new Error('Request not found')

  const shift = await getById('shifts', req.shiftId as string)
  if (!shift || shift.userId !== null)
    throw new Error('This shift has already been assigned.')

  const competing = await queryBy('openShiftRequests', [
    ['shiftId', '==', req.shiftId],
    ['status', '==', 'pending'],
  ])

  const now = new Date().toISOString()
  const batch = writeBatch(db)
  batch.update(doc(db, 'shifts', req.shiftId as string), { userId: req.userId })
  batch.update(doc(db, 'openShiftRequests', id), {
    status: 'approved',
    resolvedAt: now,
  })
  for (const other of competing) {
    if (other.id === id) continue
    batch.update(doc(db, 'openShiftRequests', other.id), {
      status: 'rejected',
      resolvedAt: now,
    })
  }
  await batch.commit()
  return toRequest({ ...req, status: 'approved', resolvedAt: now })
}

export async function rejectOpenShiftRequest(
  id: string,
): Promise<OpenShiftRequest> {
  const updated = await update('openShiftRequests', id, {
    status: 'rejected',
    resolvedAt: new Date().toISOString(),
  })
  return toRequest(updated!)
}
