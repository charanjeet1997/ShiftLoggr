import { Clock, MapPin, Repeat } from 'lucide-react'
import type { Shift } from '../types'
import { StatusBadge } from './ui/Badge'
import { formatTime, formatDate } from '../utils/formatShift'
import { cn } from '../utils/cn'

interface ShiftCardProps {
  shift: Shift
  locationName?: string
  assigneeName?: string
  onClick?: () => void
}

// Mobile-first, tap-friendly shift card (>=48px touch area).
export function ShiftCard({
  shift,
  locationName,
  assigneeName,
  onClick,
}: ShiftCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-4 shadow-sm',
        onClick &&
          'cursor-pointer transition-transform active:scale-[0.98] hover:border-gray-200',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{shift.role}</span>
        <StatusBadge status={shift.status} />
      </div>
      <div className="space-y-1 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <Clock size={13} />
          {formatDate(shift.startTime)} · {formatTime(shift.startTime)} –{' '}
          {formatTime(shift.endTime)}
        </p>
        {locationName && (
          <p className="flex items-center gap-1.5">
            <MapPin size={13} />
            {locationName}
          </p>
        )}
        {assigneeName && (
          <p className="text-gray-600">{assigneeName}</p>
        )}
        {shift.repeat !== 'none' && (
          <p className="flex items-center gap-1.5 text-gray-400">
            <Repeat size={12} />
            Repeats {shift.repeat}
          </p>
        )}
      </div>
    </div>
  )
}
