import type { SwapRequest } from '../types'
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

export interface NewSwap {
  targetId: string
  requesterShiftId: string
  targetShiftId: string
  reason: string | null
}

function toSwap(d: Raw): SwapRequest {
  return {
    requestId: d.id,
    requesterId: d.requesterId as string,
    targetId: d.targetId as string,
    requesterShiftId: d.requesterShiftId as string,
    targetShiftId: d.targetShiftId as string,
    reason: (d.reason as string | null) ?? null,
    status: d.status as SwapRequest['status'],
    createdAt: d.createdAt as string,
    resolvedAt: (d.resolvedAt as string | null) ?? null,
  }
}

export async function getSwaps(): Promise<SwapRequest[]> {
  const me = requireSession()
  const all = await roleHasPermission(me.role, 'approve_swaps')
  if (all) return (await getAll('swapRequests')).map(toSwap)

  const [asRequester, asTarget] = await Promise.all([
    queryBy('swapRequests', [['requesterId', '==', me.uid]]),
    queryBy('swapRequests', [['targetId', '==', me.uid]]),
  ])
  const byId = new Map<string, Raw>()
  for (const s of [...asRequester, ...asTarget]) byId.set(s.id, s)
  return [...byId.values()].map(toSwap)
}

export async function createSwap(payload: NewSwap): Promise<SwapRequest> {
  const me = requireSession()
  const created = await create('swapRequests', {
    requesterId: me.uid,
    targetId: payload.targetId,
    requesterShiftId: payload.requesterShiftId,
    targetShiftId: payload.targetShiftId,
    reason: payload.reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  })
  return toSwap(created)
}

// Atomic approval: reassign both shifts and mark the request approved in one
// batched write (mirrors the Firestore batch in the spec).
export async function approveSwap(id: string): Promise<SwapRequest> {
  const swap = await getById('swapRequests', id)
  if (!swap) throw new Error('Swap request not found')

  const now = new Date().toISOString()
  const batch = writeBatch(db)
  batch.update(doc(db, 'shifts', swap.requesterShiftId as string), {
    userId: swap.targetId,
  })
  batch.update(doc(db, 'shifts', swap.targetShiftId as string), {
    userId: swap.requesterId,
  })
  batch.update(doc(db, 'swapRequests', id), {
    status: 'approved',
    resolvedAt: now,
  })
  await batch.commit()
  return toSwap({ ...swap, status: 'approved', resolvedAt: now })
}

export async function rejectSwap(id: string): Promise<SwapRequest> {
  const updated = await update('swapRequests', id, {
    status: 'rejected',
    resolvedAt: new Date().toISOString(),
  })
  return toSwap(updated!)
}
