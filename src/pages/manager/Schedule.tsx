import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
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

type CalView = 'week' | 'month' | 'year'

export function Schedule() {
  const { isMobile } = useBreakpoint()
  const { shifts, loading, refresh } = useShifts()
  const data = useReferenceData()

  const [editing, setEditing] = useState<Shift | null>(null)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<CalView>('week')
  const [anchor, setAnchor] = useState(() => new Date())

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }
  function openEdit(shift: Shift) {
    setEditing(shift)
    setOpen(true)
  }

  // Current period bounds for the selected view.
  const period = useMemo(() => {
    if (view === 'week')
      return {
        start: startOfWeek(anchor, { weekStartsOn: 1 }),
        end: endOfWeek(anchor, { weekStartsOn: 1 }),
        label: `${format(startOfWeek(anchor, { weekStartsOn: 1 }), 'd MMM')} – ${format(endOfWeek(anchor, { weekStartsOn: 1 }), 'd MMM yyyy')}`,
      }
    if (view === 'month')
      return {
        start: startOfMonth(anchor),
        end: endOfMonth(anchor),
        label: format(anchor, 'MMMM yyyy'),
      }
    return {
      start: startOfYear(anchor),
      end: endOfYear(anchor),
      label: format(anchor, 'yyyy'),
    }
  }, [view, anchor])

  const inPeriod = useMemo(
    () =>
      shifts.filter((s) => {
        const t = parseISO(s.startTime).getTime()
        return t >= period.start.getTime() && t <= period.end.getTime()
      }),
    [shifts, period],
  )

  function step(dir: -1 | 1) {
    setAnchor((a) =>
      view === 'week'
        ? addWeeks(a, dir)
        : view === 'month'
          ? addMonths(a, dir)
          : addYears(a, dir),
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        subtitle={isMobile ? 'Tap a shift to edit' : 'Calendar overview'}
        action={
          <Button onClick={openCreate} className="w-auto">
            <Plus size={18} /> Add shift
          </Button>
        }
      />

      {/* ── View switcher + period navigation ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm">
          {(['week', 'month', 'year'] as CalView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1 capitalize transition-colors',
                view === v
                  ? 'bg-brand-600 font-medium text-white'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous"
            onClick={() => step(-1)}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            aria-label="Next"
            onClick={() => step(1)}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {period.label}
          </span>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading shifts…" />
      ) : view === 'year' ? (
        <YearView
          anchor={anchor}
          shifts={inPeriod}
          onPickMonth={(m) => {
            setAnchor(m)
            setView('month')
          }}
        />
      ) : isMobile ? (
        <ShiftListView shifts={inPeriod} data={data} onPick={openEdit} />
      ) : view === 'week' ? (
        <WeeklyGridView
          weekStart={period.start}
          shifts={inPeriod}
          data={data}
          onPick={openEdit}
        />
      ) : (
        <MonthGridView
          anchor={anchor}
          shifts={inPeriod}
          onPick={openEdit}
          onPickDay={(d) => {
            setAnchor(d)
            setView('week')
          }}
        />
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

// Mobile (week/month): scrollable list grouped by date.
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
  if (groups.length === 0)
    return <EmptyState title="No shifts in this period" />
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
                assigneeName={s.userId ? data.userName(s.userId) : 'Open shift'}
                onClick={() => onPick(s)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// Desktop week: 7-column grid.
function WeeklyGridView({
  weekStart,
  shifts,
  data,
  onPick,
}: {
  weekStart: Date
  shifts: Shift[]
  data: RefData
  onPick: (s: Shift) => void
}) {
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
                    {s.userId ? data.userName(s.userId) : 'Open shift'}
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

// Desktop month: classic calendar grid; shift chips per day, day header jumps
// to that week.
function MonthGridView({
  anchor,
  shifts,
  onPick,
  onPickDay,
}: {
  anchor: Date
  shifts: Shift[]
  onPick: (s: Shift) => void
  onPickDay: (d: Date) => void
}) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [anchor])

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayShifts = shifts
            .filter((s) => isSameDay(parseISO(s.startTime), day))
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
          const inMonth = isSameMonth(day, anchor)
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[92px] rounded-lg border p-1',
                inMonth
                  ? 'border-gray-100 bg-white'
                  : 'border-transparent bg-gray-50 opacity-60',
              )}
            >
              <button
                onClick={() => onPickDay(day)}
                className={cn(
                  'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday
                    ? 'bg-brand-600 font-semibold text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {format(day, 'd')}
              </button>
              <div className="space-y-0.5">
                {dayShifts.slice(0, 3).map((s) => (
                  <button
                    key={s.shiftId}
                    onClick={() => onPick(s)}
                    className="block w-full truncate rounded bg-brand-50 px-1 py-0.5 text-left text-[11px] text-brand-700 hover:bg-brand-100"
                  >
                    {formatTime(s.startTime)} {s.role}
                  </button>
                ))}
                {dayShifts.length > 3 && (
                  <p className="px-1 text-[11px] text-gray-400">
                    +{dayShifts.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Year: 12 month tiles with shift counts; click a month to open it.
function YearView({
  anchor,
  shifts,
  onPickMonth,
}: {
  anchor: Date
  shifts: Shift[]
  onPickMonth: (m: Date) => void
}) {
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(anchor), i)),
    [anchor],
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((m) => {
        const count = shifts.filter((s) =>
          isSameMonth(parseISO(s.startTime), m),
        ).length
        const isCurrent = isSameMonth(m, new Date())
        return (
          <button
            key={m.toISOString()}
            onClick={() => onPickMonth(m)}
            className={cn(
              'rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-200',
              isCurrent ? 'border-brand-200 bg-brand-50' : 'border-gray-100',
            )}
          >
            <p className="text-sm font-medium text-gray-900">
              {format(m, 'MMMM')}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {count === 0 ? 'No shifts' : `${count} shift${count === 1 ? '' : 's'}`}
            </p>
          </button>
        )
      })}
    </div>
  )
}
