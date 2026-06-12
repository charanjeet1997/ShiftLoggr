import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import type { Shift } from '../../types'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { getSwappableShifts } from '../../api/shifts'
import { createSwap } from '../../api/swaps'
import { errorMessage } from '../../api/client'
import { track } from '../../firebase'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Select,
  Spinner,
} from '../../components/ui'
import { formatShiftRange } from '../../utils/formatShift'

export function RequestSwap() {
  const { shifts, loading: loadingMine } = useShifts()
  const data = useReferenceData()
  const navigate = useNavigate()

  const [targets, setTargets] = useState<Shift[]>([])
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [myShiftId, setMyShiftId] = useState('')
  const [targetShiftId, setTargetShiftId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only future, still-scheduled shifts of mine are swappable.
  const myShifts = useMemo(
    () => shifts.filter((s) => s.status === 'scheduled'),
    [shifts],
  )

  useEffect(() => {
    getSwappableShifts()
      .then(setTargets)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingTargets(false))
  }, [])

  useEffect(() => {
    if (!myShiftId && myShifts[0]) setMyShiftId(myShifts[0].shiftId)
  }, [myShifts, myShiftId])
  useEffect(() => {
    if (!targetShiftId && targets[0]) setTargetShiftId(targets[0].shiftId)
  }, [targets, targetShiftId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const targetShift = targets.find((s) => s.shiftId === targetShiftId)
    if (!targetShift) return
    setBusy(true)
    setError(null)
    try {
      await createSwap({
        // getSwappableShifts excludes open (unassigned) shifts.
        targetId: targetShift.userId!,
        requesterShiftId: myShiftId,
        targetShiftId,
        reason: reason.trim() || null,
      })
      track('swap_request', { has_reason: reason.trim().length > 0 })
      navigate('/employee/requests')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const loading = loadingMine || loadingTargets

  return (
    <PageContainer className="max-w-lg">
      <PageHeader title="Request a swap" subtitle="Trade one of your shifts" />

      {loading ? (
        <Spinner />
      ) : myShifts.length === 0 ? (
        <EmptyState
          title="No swappable shifts"
          description="You need an upcoming scheduled shift to request a swap."
        />
      ) : targets.length === 0 ? (
        <EmptyState
          title="No colleague shifts available"
          description="There are no other shifts to swap onto right now."
        />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Select
            label="Your shift (you give up)"
            value={myShiftId}
            onChange={(e) => setMyShiftId(e.target.value)}
            options={myShifts.map((s) => ({
              value: s.shiftId,
              label: `${s.role} · ${formatShiftRange(s)}`,
            }))}
          />

          <div className="flex justify-center text-brand-600">
            <ArrowRightLeft size={20} />
          </div>

          <Select
            label="Colleague’s shift (you take)"
            value={targetShiftId}
            onChange={(e) => setTargetShiftId(e.target.value)}
            options={targets.map((s) => ({
              value: s.shiftId,
              label: `${data.userName(s.userId)} · ${s.role} · ${formatShiftRange(s)}`,
            }))}
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Reason (optional)
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why do you need this swap?"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={busy}>
            Submit request
          </Button>
        </form>
      )}
    </PageContainer>
  )
}
