import type { ClockLog, ClockPayload, ClockResult } from '../types'
import { haversineDistance } from '../utils/geoDistance'
import { create, getById, queryBy, update, type Raw } from './db'
import { requireSession } from './session'

function toLog(d: Raw): ClockLog {
  return {
    logId: d.id,
    userId: d.userId as string,
    shiftId: d.shiftId as string,
    type: d.type as ClockLog['type'],
    lat: (d.lat as number) ?? 0,
    lng: (d.lng as number) ?? 0,
    distanceFromZone: d.distanceFromZone as number,
    valid: d.valid as boolean,
    timestamp: d.timestamp as string,
  }
}

export async function clock(payload: ClockPayload): Promise<ClockResult> {
  const me = requireSession()
  const shift = await getById('shifts', payload.shiftId)
  if (!shift) throw new Error('Shift not found')

  // Clock lifecycle:
  //   scheduled → active (in) → done (out) → active (in again) …
  // Re-clock-in after an early clock-out IS allowed, as long as the shift's
  // end time hasn't passed. Once the shift has ended, it's terminal.
  const status = shift.status as string
  const ended = new Date(shift.endTime as string).getTime() <= Date.now()
  if (payload.type === 'in') {
    if (status === 'active') throw new Error('You are already clocked in to this shift')
    if (ended) throw new Error('This shift has ended — you can no longer clock in')
  } else {
    if (status !== 'active') throw new Error('You are not clocked in to this shift')
  }

  // Geofence is optional: only validate when coordinates are provided.
  const hasCoords =
    typeof payload.lat === 'number' && typeof payload.lng === 'number'
  const location = shift.locationId
    ? await getById('locations', shift.locationId as string)
    : null

  let valid = true
  let distanceFromZone = 0
  if (hasCoords && location) {
    const distance = haversineDistance(
      payload.lat as number,
      payload.lng as number,
      location.lat as number,
      location.lng as number,
    )
    distanceFromZone = Math.round(distance)
    valid = distance <= (location.radiusMeters as number)
  }

  const created = await create('clockLogs', {
    userId: me.uid,
    shiftId: payload.shiftId,
    type: payload.type,
    lat: payload.lat ?? null,
    lng: payload.lng ?? null,
    distanceFromZone,
    valid,
    timestamp: new Date().toISOString(),
  })

  if (valid) {
    await update('shifts', payload.shiftId, {
      status: payload.type === 'in' ? 'active' : 'done',
    })
  }

  return {
    valid,
    distanceFromZone,
    message: !hasCoords
      ? `Clocked ${payload.type}`
      : valid
        ? `Clocked ${payload.type} — ${distanceFromZone}m from zone`
        : `Outside geofence — ${distanceFromZone}m from zone (limit ${location?.radiusMeters}m)`,
    log: toLog(created),
  }
}

export async function getClockLogs(userId: string): Promise<ClockLog[]> {
  const rows = await queryBy('clockLogs', [['userId', '==', userId]])
  return rows
    .map(toLog)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
