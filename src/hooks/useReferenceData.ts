import { useCallback, useEffect, useState } from 'react'
import type { AuthUser, Location } from '../types'
import { getLocations } from '../api/locations'
import { getUsers } from '../api/users'
import { errorMessage } from '../api/client'

// Locations + users, with id→name/object lookup maps. Shared by most pages.
export function useReferenceData() {
  const [locations, setLocations] = useState<Location[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [locs, usrs] = await Promise.all([getLocations(), getUsers()])
      setLocations(locs)
      setUsers(usrs)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const locationName = (id: string) =>
    locations.find((l) => l.locationId === id)?.name ?? 'Unknown site'
  const location = (id: string) =>
    locations.find((l) => l.locationId === id) ?? null
  const userName = (id: string | null) =>
    id ? (users.find((u) => u.uid === id)?.name ?? 'Unknown') : 'Open shift'

  return {
    locations,
    users,
    loading,
    error,
    refresh,
    setLocations,
    locationName,
    location,
    userName,
  }
}
