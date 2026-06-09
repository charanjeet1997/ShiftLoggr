import type { ReactNode } from 'react'
import { Loader2, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { GeofenceState } from '../hooks/useGeofence'
import { cn } from '../utils/cn'

// Live "inside / outside zone" indicator for the clock-in screen.
export function GeofenceStatus({
  state,
  locationName,
  radiusMeters,
}: {
  state: GeofenceState
  locationName?: string
  radiusMeters?: number
}) {
  if (state.status === 'locating' || state.status === 'idle') {
    return (
      <Shell tone="neutral">
        <Loader2 className="animate-spin" size={20} />
        <span>Getting your location…</span>
      </Shell>
    )
  }

  if (state.status === 'error') {
    return (
      <Shell tone="neutral">
        <MapPin size={20} />
        <span>{state.error}</span>
      </Shell>
    )
  }

  if (state.inside) {
    return (
      <Shell tone="ok">
        <ShieldCheck size={20} />
        <div>
          <p className="font-medium">Inside zone</p>
          <p className="text-xs opacity-80">
            {state.distance}m from {locationName ?? 'site'} centre
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell tone="bad">
      <ShieldAlert size={20} />
      <div>
        <p className="font-medium">Outside zone</p>
        <p className="text-xs opacity-80">
          {state.distance}m away
          {radiusMeters ? ` · must be within ${radiusMeters}m` : ''}
        </p>
      </div>
    </Shell>
  )
}

function Shell({
  tone,
  children,
}: {
  tone: 'ok' | 'bad' | 'neutral'
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 text-sm',
        tone === 'ok' && 'border-green-200 bg-green-50 text-green-700',
        tone === 'bad' && 'border-red-200 bg-red-50 text-red-700',
        tone === 'neutral' && 'border-gray-200 bg-gray-50 text-gray-500',
      )}
    >
      {children}
    </div>
  )
}
