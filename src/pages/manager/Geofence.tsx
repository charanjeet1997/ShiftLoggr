import { useEffect, useState, type FormEvent } from 'react'
import { MapPin, Plus } from 'lucide-react'
import type { Location } from '../../types'
import { useReferenceData } from '../../hooks/useReferenceData'
import { createLocation, updateLocation } from '../../api/locations'
import { getGeofenceEnabled, setGeofenceEnabled } from '../../api/settings'
import { errorMessage } from '../../api/client'
import {
  Button,
  Card,
  Input,
  Modal,
  PageContainer,
  PageHeader,
  Spinner,
  Switch,
} from '../../components/ui'

export function Geofence() {
  const data = useReferenceData()
  const [editing, setEditing] = useState<Location | null>(null)
  const [open, setOpen] = useState(false)

  // Geofencing on/off (Firestore-backed app setting).
  const [geoOn, setGeoOn] = useState(false)
  const [geoSaving, setGeoSaving] = useState(false)
  useEffect(() => {
    getGeofenceEnabled().then(setGeoOn).catch(() => setGeoOn(false))
  }, [])
  async function toggleGeo(next: boolean) {
    setGeoOn(next) // optimistic
    setGeoSaving(true)
    try {
      await setGeofenceEnabled(next)
    } catch {
      setGeoOn(!next) // revert on failure
    } finally {
      setGeoSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Geofence zones"
        subtitle="Sites and their clock-in radius"
        action={
          <Button
            className="w-auto"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            <Plus size={18} /> Add zone
          </Button>
        }
      />

      {/* Global geofencing toggle */}
      <Card className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Require location for clock-in
          </p>
          <p className="text-xs text-gray-500">
            {geoOn
              ? 'Employees must be inside a zone — their GPS is checked at clock-in.'
              : 'Off — employees can clock in/out without any location check.'}
          </p>
        </div>
        <Switch
          checked={geoOn}
          onChange={toggleGeo}
          disabled={geoSaving}
          label="Toggle geofencing"
        />
      </Card>

      {data.loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.locations.map((loc) => (
            <Card key={loc.locationId}>
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <MapPin size={18} />
                </span>
                <p className="font-medium text-gray-900">{loc.name}</p>
              </div>
              <dl className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <dt>Latitude</dt>
                  <dd className="font-mono text-gray-700">{loc.lat.toFixed(5)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Longitude</dt>
                  <dd className="font-mono text-gray-700">{loc.lng.toFixed(5)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Radius</dt>
                  <dd className="font-mono text-gray-700">{loc.radiusMeters} m</dd>
                </div>
              </dl>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setEditing(loc)
                  setOpen(true)
                }}
              >
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}

      <ZoneModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={data.refresh}
        location={editing}
      />
    </PageContainer>
  )
}

function ZoneModal({
  open,
  onClose,
  onSaved,
  location,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  location: Location | null
}) {
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radius, setRadius] = useState('100')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setName(location?.name ?? '')
    setLat(location ? String(location.lat) : '')
    setLng(location ? String(location.lng) : '')
    setRadius(location ? String(location.radiusMeters) : '100')
  }, [open, location])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const payload = {
        name,
        lat: Number(lat),
        lng: Number(lng),
        radiusMeters: Number(radius),
      }
      if (location) await updateLocation(location.locationId, payload)
      else await createLocation(payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={location ? 'Edit zone' : 'Add zone'}
      footer={
        <Button type="submit" form="zone-form" loading={busy} className="ml-auto">
          {location ? 'Save' : 'Create'}
        </Button>
      }
    >
      <form id="zone-form" onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. North Depot"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
        </div>
        <Input
          label="Radius (metres)"
          type="number"
          min="10"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
