import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useSwaps } from '../../hooks/useSwaps'
import { useShifts } from '../../hooks/useShifts'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useAuth } from '../../hooks/useAuth'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'
import { SwapRequestCard } from '../../components/SwapRequestCard'

export function SwapStatus() {
  const { user } = useAuth()
  const { swaps, loading } = useSwaps()
  const { shifts } = useShifts()
  const data = useReferenceData()

  const shiftById = (id: string) => shifts.find((s) => s.shiftId === id)
  const nameOf = (uid: string) =>
    uid === user?.uid ? 'You' : data.userName(uid)

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="My requests"
        action={
          <Link to="/employee/swap">
            <Button className="w-auto">
              <Plus size={18} /> New
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Spinner />
      ) : swaps.length === 0 ? (
        <EmptyState
          title="No swap requests"
          description="Requests you submit will show their status here."
          action={
            <Link to="/employee/swap">
              <Button>
                <Plus size={18} /> Request a swap
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {swaps.map((swap) => (
            <SwapRequestCard
              key={swap.requestId}
              swap={swap}
              requesterName={nameOf(swap.requesterId)}
              targetName={nameOf(swap.targetId)}
              requesterShift={shiftById(swap.requesterShiftId)}
              targetShift={shiftById(swap.targetShiftId)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
