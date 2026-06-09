import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Repeat, Users } from 'lucide-react'
import { isSameDay, parseISO } from 'date-fns'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useAuth } from '../../hooks/useAuth'
import {
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'
import { ShiftCard } from '../../components/ShiftCard'

export function Dashboard() {
  const { user } = useAuth()
  const { shifts, loading } = useShifts()
  const data = useReferenceData()

  const today = useMemo(
    () =>
      shifts
        .filter((s) => isSameDay(parseISO(s.startTime), new Date()))
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [shifts],
  )

  const activeCount = shifts.filter((s) => s.status === 'active').length

  return (
    <PageContainer>
      <PageHeader
        title={`Hi, ${user?.name?.split(' ')[0] ?? 'there'}`}
        subtitle="Here’s what’s happening today"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={<CalendarDays size={18} />} label="Shifts today" value={today.length} to="/manager/schedule" />
        <Stat icon={<Clock size={18} />} label="Active now" value={activeCount} to="/manager/schedule" />
        <Stat icon={<Users size={18} />} label="Team members" value={data.users.filter((u) => u.role === 'employee').length} to="/manager/team" />
        <Stat icon={<Repeat size={18} />} label="Locations" value={data.locations.length} to="/manager/geofence" />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-gray-700">Today’s shifts</h2>
      {loading ? (
        <Spinner />
      ) : today.length === 0 ? (
        <EmptyState title="No shifts scheduled today" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {today.map((s) => (
            <ShiftCard
              key={s.shiftId}
              shift={s}
              locationName={data.locationName(s.locationId)}
              assigneeName={data.userName(s.userId)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function Stat({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode
  label: string
  value: number
  to: string
}) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 transition-colors hover:border-brand-200">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </Card>
    </Link>
  )
}
