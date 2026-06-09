import { useState } from 'react'
import { useSwaps } from '../../hooks/useSwaps'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { approveSwap, rejectSwap } from '../../api/swaps'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import {
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'
import { SwapRequestCard } from '../../components/SwapRequestCard'

export function SwapRequests() {
  const { swaps, loading, refresh } = useSwaps()
  const { shifts } = useShifts()
  const data = useReferenceData()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = swaps.filter((s) => s.status === 'pending')
  const resolved = swaps.filter((s) => s.status !== 'pending')
  const shiftById = (id: string) => shifts.find((s) => s.shiftId === id)

  async function act(id: string, kind: 'approve' | 'reject') {
    setBusyId(id)
    setError(null)
    try {
      await (kind === 'approve' ? approveSwap(id) : rejectSwap(id))
      track(kind === 'approve' ? 'swap_approved' : 'swap_rejected')
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Swap requests" subtitle="Approve or reject shift swaps" />

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading requests…" />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <EmptyState title="No pending requests" />
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {pending.map((swap) => (
                  <SwapRequestCard
                    key={swap.requestId}
                    swap={swap}
                    requesterName={data.userName(swap.requesterId)}
                    targetName={data.userName(swap.targetId)}
                    requesterShift={shiftById(swap.requesterShiftId)}
                    targetShift={shiftById(swap.targetShiftId)}
                    busy={busyId === swap.requestId}
                    onApprove={() => act(swap.requestId, 'approve')}
                    onReject={() => act(swap.requestId, 'reject')}
                  />
                ))}
              </div>
            )}
          </section>

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Resolved
              </h2>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {resolved.map((swap) => (
                  <SwapRequestCard
                    key={swap.requestId}
                    swap={swap}
                    requesterName={data.userName(swap.requesterId)}
                    targetName={data.userName(swap.targetId)}
                    requesterShift={shiftById(swap.requesterShiftId)}
                    targetShift={shiftById(swap.targetShiftId)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  )
}
