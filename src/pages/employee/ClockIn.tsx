import { useEffect, useMemo, useState } from 'react'
import { isToday, parseISO } from 'date-fns'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useGeofence } from '../../hooks/useGeofence'
import { clock } from '../../api/clock'
import { getGeofenceEnabled } from '../../api/settings'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import type { ClockPayload, ClockResult, Shift } from '../../types'
import {
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'
import { GeofenceStatus } from '../../components/GeofenceStatus'
import { formatShiftRange } from '../../utils/formatShift'
import { cn } from '../../utils/cn'

// Pick the shift to clock for:
//   1. a currently clocked-in (active) shift → so you can clock OUT, else
//   2. the soonest shift today that hasn't ended yet and is either fresh
//      ('scheduled') or already clocked-out ('done') → to clock IN / resume.
// Once a shift's end time passes it's excluded, so it can't be clocked again.
function pickShift(shifts: Shift[]): Shift | null {
  const active = shifts.find((s) => s.status === 'active')
  if (active) return active
  const now = Date.now()
  const clockable = shifts
    .filter(
      (s) =>
        (s.status === 'scheduled' || s.status === 'done') &&
        isToday(parseISO(s.startTime)) &&
        parseISO(s.endTime).getTime() > now,
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  return clockable[0] ?? null
}

export function ClockIn() {
  const { shifts, loading, refresh } = useShifts()
  const data = useReferenceData()
  const shift = useMemo(() => pickShift(shifts), [shifts])

  // Whether geofencing is enabled (manager setting). Drives live GPS preview.
  const [geoOn, setGeoOn] = useState(false)
  useEffect(() => {
    getGeofenceEnabled().then(setGeoOn).catch(() => setGeoOn(false))
  }, [])

  const location = shift ? data.location(shift.locationId) : null
  const geo = useGeofence(location, geoOn) // only watches GPS when geoOn

  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ClockResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isClockedIn = shift?.status === 'active'
  // When geofencing is on, wait for a GPS fix before allowing a clock action.
  const waitingForGps = geoOn && !geo.coords && geo.status !== 'error'

  async function handleClock() {
    if (!shift) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const payload: ClockPayload = {
        shiftId: shift.shiftId,
        type: isClockedIn ? 'out' : 'in',
      }
      // Only send coordinates when geofencing is on; otherwise the server
      // skips validation (lat/lng absent → always valid).
      if (geoOn && geo.coords) {
        payload.lat = geo.coords.lat
        payload.lng = geo.coords.lng
      }
      const res = await clock(payload)
      setResult(res)
      track(isClockedIn ? 'clock_out' : 'clock_in', { valid: res.valid })
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageContainer><Spinner /></PageContainer>

  return (
    <PageContainer className="max-w-md">
      <PageHeader title="Clock in / out" />

      <div className="space-y-4">
        {/* Confirmation persists even after the shift clears (e.g. once the
            shift ends right after clocking out). */}
        {result && (
          <div
            className={cn(
              'rounded-xl border p-3 text-sm',
              result.valid
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700',
            )}
          >
            {result.message}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {!shift ? (
          <EmptyState
            title="No shift to clock"
            description="You have no active or upcoming shift to clock right now."
          />
        ) : (
          <>
            {/* Current shift summary */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-900">{shift.role}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatShiftRange(shift)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {data.locationName(shift.locationId)}
              </p>
              {shift.status === 'done' && (
                <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  You clocked out early — clock in again to resume this shift.
                </p>
              )}
            </div>

            {/* Live geofence preview (only when geofencing is enabled) */}
            {geoOn && (
              <GeofenceStatus
                state={geo}
                locationName={location?.name}
                radiusMeters={location?.radiusMeters}
              />
            )}

            {/* Large thumb-friendly clock button */}
            <button
              onClick={handleClock}
              disabled={busy || waitingForGps}
              className={cn(
                'w-full rounded-2xl py-5 text-lg font-medium text-white transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isClockedIn
                  ? 'bg-gray-800 active:bg-gray-900'
                  : 'bg-brand-600 active:bg-brand-700',
              )}
            >
              {busy
                ? 'Submitting…'
                : waitingForGps
                  ? 'Getting your location…'
                  : isClockedIn
                    ? 'Clock out'
                    : shift.status === 'done'
                      ? 'Clock in to resume'
                      : 'Clock in'}
            </button>
          </>
        )}
      </div>
    </PageContainer>
  )
}
