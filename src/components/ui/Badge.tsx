import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import type { ShiftStatus, SwapStatus } from '../../types'

type Tone = 'gray' | 'green' | 'amber' | 'red' | 'teal' | 'blue'

const tones: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  teal: 'bg-brand-100 text-brand-700',
  blue: 'bg-blue-100 text-blue-700',
}

export function Badge({
  tone = 'gray',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const shiftTone: Record<ShiftStatus, Tone> = {
  scheduled: 'blue',
  active: 'green',
  done: 'gray',
}

const swapTone: Record<SwapStatus, Tone> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
}

export function StatusBadge({ status }: { status: ShiftStatus }) {
  return <Badge tone={shiftTone[status]}>{status}</Badge>
}

export function SwapStatusBadge({ status }: { status: SwapStatus }) {
  return <Badge tone={swapTone[status]}>{status}</Badge>
}
