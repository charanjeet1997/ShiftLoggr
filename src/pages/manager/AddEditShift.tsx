import { useEffect, useState, type FormEvent } from 'react'
import type { AuthUser, Location, Shift, ShiftRepeat } from '../../types'
import { Button, Input, Modal, Select } from '../../components/ui'
import { createShift, updateShift, deleteShift } from '../../api/shifts'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import { JOB_ROLES } from '../../constants/jobRoles'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  shift: Shift | null // null = create
  users: AuthUser[]
  locations: Location[]
}

// datetime-local needs "yyyy-MM-ddTHH:mm" in *local* time.
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const repeatOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
]

export function AddEditShift({
  open,
  onClose,
  onSaved,
  shift,
  users,
  locations,
}: Props) {
  const employees = users.filter((u) => u.role === 'employee')
  const [userId, setUserId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [role, setRole] = useState('Operator')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [repeat, setRepeat] = useState<ShiftRepeat>('none')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (shift) {
      setUserId(shift.userId)
      setLocationId(shift.locationId)
      setRole(shift.role)
      setStart(toLocalInput(shift.startTime))
      setEnd(toLocalInput(shift.endTime))
      setRepeat(shift.repeat)
    } else {
      setUserId(employees[0]?.uid ?? '')
      setLocationId(locations[0]?.locationId ?? '')
      setRole('Operator')
      setStart('')
      setEnd('')
      setRepeat('none')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shift])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (new Date(end) <= new Date(start)) {
      setError('End time must be after start time')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const payload = {
        userId,
        locationId,
        role,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        repeat,
      }
      if (shift) {
        await updateShift(shift.shiftId, payload)
        track('shift_updated', { role: payload.role, repeat: payload.repeat })
      } else {
        await createShift(payload)
        track('shift_created', { role: payload.role, repeat: payload.repeat })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!shift) return
    setBusy(true)
    try {
      await deleteShift(shift.shiftId)
      track('shift_deleted')
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
      title={shift ? 'Edit shift' : 'Add shift'}
      footer={
        <>
          {shift && (
            <Button variant="danger" onClick={onDelete} disabled={busy}>
              Delete
            </Button>
          )}
          <Button
            type="submit"
            form="shift-form"
            loading={busy}
            className="ml-auto"
          >
            {shift ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="shift-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Employee"
          name="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          options={employees.map((u) => ({ value: u.uid, label: u.name }))}
          required
        />
        <Select
          label="Role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          // Include the current role even if it's not in the preset list (e.g.
          // an older shift) so editing never loses the value.
          options={(JOB_ROLES.includes(role as (typeof JOB_ROLES)[number])
            ? [...JOB_ROLES]
            : [role, ...JOB_ROLES]
          ).map((rname) => ({ value: rname, label: rname }))}
          required
        />
        <Input
          label="Start"
          name="start"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <Input
          label="End"
          name="end"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
        <Select
          label="Location"
          name="locationId"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={locations.map((l) => ({
            value: l.locationId,
            label: l.name,
          }))}
          required
        />
        <Select
          label="Repeat"
          name="repeat"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value as ShiftRepeat)}
          options={repeatOptions}
        />
        {error && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
