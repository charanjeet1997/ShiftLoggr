import { format, isSameDay, parseISO } from 'date-fns'
import type { Shift } from '../types'

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'EEE d MMM')
}

export function formatDayKey(iso: string): string {
  return format(parseISO(iso), 'yyyy-MM-dd')
}

export function formatShiftRange(shift: Shift): string {
  const start = parseISO(shift.startTime)
  const end = parseISO(shift.endTime)
  const sameDay = isSameDay(start, end)
  return sameDay
    ? `${format(start, 'EEE d MMM')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
    : `${format(start, 'EEE d MMM h:mm a')} – ${format(end, 'EEE d MMM h:mm a')}`
}

/** Group shifts by calendar day, sorted ascending. */
export function groupShiftsByDay(shifts: Shift[]): [string, Shift[]][] {
  const map = new Map<string, Shift[]>()
  for (const shift of shifts) {
    const key = formatDayKey(shift.startTime)
    const bucket = map.get(key) ?? []
    bucket.push(shift)
    map.set(key, bucket)
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}
