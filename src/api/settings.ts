import { create, getById } from './db'

// App-wide settings stored in Firestore (settings/{key}). Currently just the
// geofence on/off switch that managers control and the Clock In page respects.

export async function getGeofenceEnabled(): Promise<boolean> {
  const doc = await getById('settings', 'geofence')
  return Boolean(doc?.enabled)
}

export async function setGeofenceEnabled(enabled: boolean): Promise<void> {
  await create('settings', { enabled }, 'geofence')
}
