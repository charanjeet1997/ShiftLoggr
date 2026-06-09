import { ArrowRightLeft } from 'lucide-react'
import type { Shift, SwapRequest } from '../types'
import { Button } from './ui/Button'
import { SwapStatusBadge } from './ui/Badge'
import { formatShiftRange } from '../utils/formatShift'

interface SwapRequestCardProps {
  swap: SwapRequest
  requesterName?: string
  targetName?: string
  requesterShift?: Shift
  targetShift?: Shift
  /** Manager actions — omitted for employee view. */
  onApprove?: () => void
  onReject?: () => void
  busy?: boolean
}

export function SwapRequestCard({
  swap,
  requesterName,
  targetName,
  requesterShift,
  targetShift,
  onApprove,
  onReject,
  busy,
}: SwapRequestCardProps) {
  const showActions = swap.status === 'pending' && (onApprove || onReject)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <ArrowRightLeft size={15} className="text-brand-600" />
          Shift swap
        </span>
        <SwapStatusBadge status={swap.status} />
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-1 font-medium text-gray-700">
            {requesterName ?? 'Requester'} gives up
          </p>
          <p className="text-gray-500">
            {requesterShift ? formatShiftRange(requesterShift) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-1 font-medium text-gray-700">
            {targetName ?? 'Target'} gives up
          </p>
          <p className="text-gray-500">
            {targetShift ? formatShiftRange(targetShift) : '—'}
          </p>
        </div>
      </div>

      {swap.reason && (
        <p className="mt-3 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Reason:</span>{' '}
          {swap.reason}
        </p>
      )}

      {showActions && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onApprove}
            loading={busy}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onReject}
            disabled={busy}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}
