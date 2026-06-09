import type { Location } from '../types'
import { create, getAll, update, type Raw } from './db'

export type NewLocation = Omit<Location, 'locationId'>

function toLocation(d: Raw): Location {
  return {
    locationId: d.id,
    name: d.name as string,
    lat: d.lat as number,
    lng: d.lng as number,
    radiusMeters: d.radiusMeters as number,
  }
}

export async function getLocations(): Promise<Location[]> {
  return (await getAll('locations')).map(toLocation)
}

export async function createLocation(payload: NewLocation): Promise<Location> {
  return toLocation(await create('locations', { ...payload }))
}

export async function updateLocation(
  id: string,
  patch: Partial<Location>,
): Promise<Location> {
  const { locationId: _omit, ...rest } = patch
  void _omit
  const updated = await update('locations', id, rest)
  return toLocation(updated!)
}
