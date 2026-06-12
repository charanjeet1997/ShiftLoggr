import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { OpenShiftRequest } from '../../types'
import {
  approveOpenShiftRequest,
  getOpenShiftRequests,
  rejectOpenShiftRequest,
} from '../../api/openShifts'
import { formatTime } from '../../utils/formatShift'
import { useSwaps } from '../../hooks/useSwaps'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { approveSwap, rejectSwap } from '../../api/swaps'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import {
  Button,
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

  // Open-shift claims live in their own collection but are approved here too.
  const [openReqs, setOpenReqs] = useState<OpenShiftRequest[]>([])
  const refreshOpen = useCallback(async () => {
    try {
      setOpenReqs(await getOpenShiftRequests())
    } catch {
      // non-fatal: swaps still render
    }
  }, [])
  useEffect(() => {
    void refreshOpen()
  }, [refreshOpen])

  const pending = swaps.filter((s) => s.status === 'pending')
  const resolved = swaps.filter((s) => s.status !== 'pending')
  const shiftById = (id: string) => shifts.find((s) => s.shiftId === id)

  const pendingOpen = openReqs.filter((r) => r.status === 'pending')

  async function actOpen(id: string, kind: 'approve' | 'reject') {
    setBusyId(id)
    setError(null)
    try {
      await (kind === 'approve'
        ? approveOpenShiftRequest(id)
        : rejectOpenShiftRequest(id))
      track(kind === 'approve' ? 'open_shift_approved' : 'open_shift_rejected')
      await Promise.all([refreshOpen(), refresh()])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

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
          {pendingOpen.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Open shift requests ({pendingOpen.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {pendingOpen.map((r) => {
                  const shift = shiftById(r.shiftId)
                  return (
                    <div
                      key={r.requestId}
                      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {data.userName(r.userId)} wants this open shift
                      </p>
                      {shift && (
                        <p className="mt-1 text-xs text-gray-500">
                          {shift.role} ·{' '}
                          {format(parseISO(shift.startTime), 'EEE d MMM')} ·{' '}
                          {formatTime(shift.startTime)} –{' '}
                          {formatTime(shift.endTime)}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button
                          className="w-auto"
                          loading={busyId === r.requestId}
                          onClick={() => actOpen(r.requestId, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          className="w-auto"
                          disabled={busyId === r.requestId}
                          onClick={() => actOpen(r.requestId, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

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
