import { useEffect, useRef, useState } from 'react'
import type { Location } from '../types'
import { haversineDistance } from '../utils/geoDistance'

export interface GeofenceState {
  status: 'idle' | 'locating' | 'ready' | 'error'
  inside: boolean | null
  distance: number | null // metres from zone centre
  coords: { lat: number; lng: number } | null
  error: string | null
}

// Live geofence preview via watchPosition. Server always re-validates on clock —
// never trust this result alone (see spec). Pass active=false to skip watching
// entirely (e.g. when geofencing is turned off).
export function useGeofence(
  location: Location | null,
  active = true,
): GeofenceState {
  const [state, setState] = useState<GeofenceState>({
    status: 'idle',
    inside: null,
    distance: null,
    coords: null,
    error: null,
  })
  // Keep latest location in a ref so the watcher doesn't restart on each change.
  const locationRef = useRef<Location | null>(location)
  locationRef.current = location

  useEffect(() => {
    if (!active) return
    if (!('geolocation' in navigator)) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: 'Geolocation not supported on this device',
      }))
      return
    }

    setState((s) => ({ ...s, status: 'locating' }))

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const loc = locationRef.current
        if (!loc) {
          setState({
            status: 'ready',
            inside: null,
            distance: null,
            coords: { lat, lng },
            error: null,
          })
          return
        }
        const distance = haversineDistance(lat, lng, loc.lat, loc.lng)
        setState({
          status: 'ready',
          inside: distance <= loc.radiusMeters,
          distance: Math.round(distance),
          coords: { lat, lng },
          error: null,
        })
      },
      (err) => {
        setState((s) => ({
          ...s,
          status: 'error',
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied'
              : 'Could not get your location',
        }))
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [active])

  return state
}
