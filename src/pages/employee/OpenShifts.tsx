import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { OpenShiftRequest, Shift } from '../../types'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { getOpenShifts } from '../../api/shifts'
import {
  createOpenShiftRequest,
  getOpenShiftRequests,
  hasUnfinishedShift,
} from '../../api/openShifts'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import {
  Button,
  EmptyState,
  Modal,
  PageContainer,
  PageHeader,
  Spinner,
  SwapStatusBadge,
} from '../../components/ui'
import { ShiftCard } from '../../components/ShiftCard'

export function OpenShifts() {
  // Own shifts — drives the "one shift at a time" eligibility rule.
  const { shifts: myShifts, loading: myLoading } = useShifts()
  const data = useReferenceData()

  const [openShifts, setOpenShifts] = useState<Shift[]>([])
  const [requests, setRequests] = useState<OpenShiftRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showBlocked, setShowBlocked] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [shifts, reqs] = await Promise.all([
        getOpenShifts(),
        getOpenShiftRequests(),
      ])
      setOpenShifts(shifts)
      setRequests(reqs)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const blocked = useMemo(() => hasUnfinishedShift(myShifts), [myShifts])
  const pendingByShift = (shiftId: string) =>
    requests.find((r) => r.shiftId === shiftId && r.status === 'pending')

  async function request(shift: Shift) {
    if (blocked) {
      setShowBlocked(true)
      return
    }
    setBusyId(shift.shiftId)
    setError(null)
    try {
      await createOpenShiftRequest(shift.shiftId)
      track('open_shift_requested', { role: shift.role })
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const resolved = requests.filter((r) => r.status !== 'pending')

  return (
    <PageContainer>
      <PageHeader
        title="Open shifts"
        subtitle="Unassigned shifts you can request to take"
      />

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {blocked && !myLoading && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          You have a shift on your schedule, so you can browse open shifts but
          not request one until your shift is completed.
        </p>
      )}

      {loading || myLoading ? (
        <Spinner label="Loading open shifts…" />
      ) : (
        <div className="space-y-6">
          <section>
            {openShifts.length === 0 ? (
              <EmptyState
                title="No open shifts"
                description="When your manager posts an unassigned shift, it appears here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {openShifts.map((s) => {
                  const pending = pendingByShift(s.shiftId)
                  return (
                    <div key={s.shiftId} className="space-y-2">
                      <ShiftCard
                        shift={s}
                        locationName={data.locationName(s.locationId)}
                      />
                      {pending ? (
                        <p className="rounded-lg bg-brand-50 px-3 py-2 text-center text-xs font-medium text-brand-700">
                          Requested — waiting for manager approval
                        </p>
                      ) : (
                        <Button
                          onClick={() => request(s)}
                          loading={busyId === s.shiftId}
                        >
                          Request this shift
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Past requests
              </h2>
              <div className="space-y-2">
                {resolved.map((r) => (
                  <div
                    key={r.requestId}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <span className="text-sm text-gray-600">
                      Open shift request
                    </span>
                    <SwapStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={showBlocked}
        onClose={() => setShowBlocked(false)}
        title="You already have a shift"
        footer={
          <Button className="ml-auto" onClick={() => setShowBlocked(false)}>
            Got it
          </Button>
        }
      >
        <p className="text-sm text-gray-600">
          You can only take one shift at a time. Once your current shift is
          completed, come back here to request an open shift.
        </p>
      </Modal>
    </PageContainer>
  )
}
