import { useState, type ReactNode } from 'react'
import { Mail, MapPin, Trash2 } from 'lucide-react'
import type { AuthUser } from '../../types'
import { useReferenceData } from '../../hooks/useReferenceData'
import { useShifts } from '../../hooks/useShifts'
import { deleteUser } from '../../api/users'
import { errorMessage } from '../../api/client'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageContainer,
  PageHeader,
  Spinner,
} from '../../components/ui'

export function Team() {
  const data = useReferenceData()
  const { shifts } = useShifts()

  const employees = data.users.filter((u) => u.role === 'employee')
  const managers = data.users.filter((u) => u.role === 'manager')

  const shiftCount = (uid: string) =>
    shifts.filter((s) => s.userId === uid).length

  // Account pending deletion (confirmation modal).
  const [toDelete, setToDelete] = useState<AuthUser | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    setBusy(true)
    setError(null)
    try {
      await deleteUser(toDelete.uid)
      setToDelete(null)
      await data.refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Team" subtitle={`${employees.length} employees`} />

      {data.loading ? (
        <Spinner />
      ) : data.users.length === 0 ? (
        <EmptyState title="No team members" />
      ) : (
        <div className="space-y-6">
          <Section title="Employees">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((u) => (
                <Card key={u.uid} className="flex items-start gap-3">
                  <Avatar name={u.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{u.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      {shiftCount(u.uid)} shifts
                    </p>
                  </div>
                  <Badge tone="teal">employee</Badge>
                  <button
                    onClick={() => setToDelete(u)}
                    aria-label={`Delete ${u.name}`}
                    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              ))}
            </div>
          </Section>

          {managers.length > 0 && (
            <Section title="Managers">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {managers.map((u) => (
                  <Card key={u.uid} className="flex items-center gap-3">
                    <Avatar name={u.name} />
                    <p className="flex-1 truncate font-medium text-gray-900">
                      {u.name}
                    </p>
                    <Mail size={15} className="text-gray-300" />
                  </Card>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Delete-account confirmation */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={busy} className="ml-auto">
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Permanently delete <span className="font-medium text-gray-900">{toDelete?.name}</span>’s
          account? This can’t be undone.
        </p>
        {toDelete && shiftCount(toDelete.uid) > 0 && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            They’re still assigned to {shiftCount(toDelete.uid)} shift(s). Those shifts will
            remain but show as unassigned — reassign or delete them from the Schedule.
          </p>
        )}
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </Modal>
    </PageContainer>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </section>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
      {initials}
    </span>
  )
}
