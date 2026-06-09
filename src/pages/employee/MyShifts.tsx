import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Clock, History, LogIn, LogOut } from 'lucide-react'
import type { ClockLog, Shift } from '../../types'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useAuth } from '../../hooks/useAuth'
import { getClockLogs } from '../../api/clock'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
  StatusBadge,
} from '../../components/ui'
import { ShiftCard } from '../../components/ShiftCard'
import { groupShiftsByDay, formatTime } from '../../utils/formatShift'

// A shift is history once its end time has passed. A shift clocked-out early
// (status 'done' but not yet ended) stays in Upcoming so it can be resumed.
function isPast(s: Shift): boolean {
  return parseISO(s.endTime).getTime() < Date.now()
}

export function MyShifts() {
  const { user } = useAuth()
  const { shifts, loading } = useShifts()
  const data = useReferenceData()

  // Clock logs power the "actual in/out times" in the history section.
  const [logs, setLogs] = useState<ClockLog[]>([])
  useEffect(() => {
    if (!user) return
    getClockLogs(user.uid)
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [user])

  const upcoming = useMemo(() => shifts.filter((s) => !isPast(s)), [shifts])
  const past = useMemo(
    () =>
      shifts
        .filter(isPast)
        .sort((a, b) => b.startTime.localeCompare(a.startTime)),
    [shifts],
  )
  const upcomingGroups = groupShiftsByDay(upcoming)

  // Latest clock-in / clock-out timestamp recorded for a shift.
  function clockTimes(shiftId: string) {
    const forShift = logs.filter((l) => l.shiftId === shiftId)
    const latest = (type: 'in' | 'out') =>
      forShift
        .filter((l) => l.type === type)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.timestamp
    return { in: latest('in'), out: latest('out') }
  }

  return (
    <PageContainer>
      <PageHeader
        title="My shifts"
        action={
          <Link to="/employee/clock">
            <Button className="w-auto">
              <Clock size={18} /> Clock
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Spinner label="Loading your shifts…" />
      ) : shifts.length === 0 ? (
        <EmptyState
          title="No shifts assigned"
          description="When your manager schedules you, shifts appear here."
        />
      ) : (
        <div className="space-y-8">
          {/* ── Upcoming ───────────────────────────── */}
          <div className="space-y-5">
            {upcomingGroups.length === 0 ? (
              <EmptyState title="No upcoming shifts" />
            ) : (
              upcomingGroups.map(([day, dayShifts]) => (
                <section key={day}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {format(parseISO(day), 'EEEE d MMM')}
                  </h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {dayShifts.map((s) => (
                      <ShiftCard
                        key={s.shiftId}
                        shift={s}
                        locationName={data.locationName(s.locationId)}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* ── History ────────────────────────────── */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <History size={14} /> Shift history
              </h2>
              <div className="space-y-2">
                {past.map((s) => {
                  const t = clockTimes(s.shiftId)
                  return (
                    <div
                      key={s.shiftId}
                      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {s.role}
                        </span>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(s.startTime), 'EEE d MMM')} ·{' '}
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {data.locationName(s.locationId)}
                      </p>
                      {(t.in || t.out) && (
                        <div className="mt-2 flex flex-wrap gap-3 border-t border-gray-50 pt-2 text-xs">
                          {t.in && (
                            <span className="flex items-center gap-1 text-green-600">
                              <LogIn size={13} /> In {formatTime(t.in)}
                            </span>
                          )}
                          {t.out && (
                            <span className="flex items-center gap-1 text-gray-500">
                              <LogOut size={13} /> Out {formatTime(t.out)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  )
}
