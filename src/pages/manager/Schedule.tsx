import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import type { Shift } from '../../types'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'
import { ShiftCard } from '../../components/ShiftCard'
import { groupShiftsByDay, formatTime } from '../../utils/formatShift'
import { AddEditShift } from './AddEditShift'
import { cn } from '../../utils/cn'

export function Schedule() {
  const { isMobile } = useBreakpoint()
  const { shifts, loading, refresh } = useShifts()
  const data = useReferenceData()

  const [editing, setEditing] = useState<Shift | null>(null)
  const [open, setOpen] = useState(false)

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }
  function openEdit(shift: Shift) {
    setEditing(shift)
    setOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        subtitle={isMobile ? 'Tap a shift to edit' : 'Weekly overview'}
        action={
          <Button onClick={openCreate} className="w-auto">
            <Plus size={18} /> Add shift
          </Button>
        }
      />

      {loading ? (
        <Spinner label="Loading shifts…" />
      ) : shifts.length === 0 ? (
        <EmptyState
          title="No shifts yet"
          description="Create the first shift to start building the schedule."
          action={
            <Button onClick={openCreate}>
              <Plus size={18} /> Add shift
            </Button>
          }
        />
      ) : isMobile ? (
        <ShiftListView shifts={shifts} data={data} onPick={openEdit} />
      ) : (
        <WeeklyGridView shifts={shifts} data={data} onPick={openEdit} />
      )}

      <AddEditShift
        open={open}
        onClose={() => setOpen(false)}
        onSaved={refresh}
        shift={editing}
        users={data.users}
        locations={data.locations}
      />
    </PageContainer>
  )
}

type RefData = ReturnType<typeof useReferenceData>

// Mobile: scrollable list grouped by date.
function ShiftListView({
  shifts,
  data,
  onPick,
}: {
  shifts: Shift[]
  data: RefData
  onPick: (s: Shift) => void
}) {
  const groups = groupShiftsByDay(shifts)
  return (
    <div className="space-y-5">
      {groups.map(([day, dayShifts]) => (
        <section key={day}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {format(parseISO(day), 'EEEE d MMM')}
          </h2>
          <div className="space-y-2">
            {dayShifts.map((s) => (
              <ShiftCard
                key={s.shiftId}
                shift={s}
                locationName={data.locationName(s.locationId)}
                assigneeName={data.userName(s.userId)}
                onClick={() => onPick(s)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// Desktop: 7-column weekly grid (current week).
function WeeklyGridView({
  shifts,
  data,
  onPick,
}: {
  shifts: Shift[]
  data: RefData
  onPick: (s: Shift) => void
}) {
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), [])
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayShifts = shifts
          .filter((s) => isSameDay(parseISO(s.startTime), day))
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
        const isToday = isSameDay(day, new Date())
        return (
          <div key={day.toISOString()} className="min-h-[160px]">
            <div
              className={cn(
                'mb-2 rounded-lg px-2 py-1 text-center text-xs font-medium',
                isToday ? 'bg-brand-50 text-brand-700' : 'text-gray-500',
              )}
            >
              <div>{format(day, 'EEE')}</div>
              <div className="text-base text-gray-900">{format(day, 'd')}</div>
            </div>
            <div className="space-y-2">
              {dayShifts.map((s) => (
                <button
                  key={s.shiftId}
                  onClick={() => onPick(s)}
                  className="w-full rounded-lg border border-gray-100 bg-white p-2 text-left text-xs shadow-sm transition-colors hover:border-brand-200"
                >
                  <p className="font-medium text-gray-900">{s.role}</p>
                  <p className="text-gray-500">
                    {formatTime(s.startTime)}–{formatTime(s.endTime)}
                  </p>
                  <p className="truncate text-gray-400">
                    {data.userName(s.userId)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
