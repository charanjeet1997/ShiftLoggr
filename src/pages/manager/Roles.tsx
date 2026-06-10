import { useEffect, useState, type FormEvent } from 'react'
import { Lock, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import type { Area, Permission, RoleDef } from '../../types'
import { getRoles, createRole, updateRole, deleteRole } from '../../api/roles'
import { errorMessage } from '../../api/client'
import { PERMISSION_CATALOG } from '../../constants/permissions'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageContainer,
  PageHeader,
  Select,
  Spinner,
} from '../../components/ui'

function permissionLabel(key: Permission): string {
  for (const g of PERMISSION_CATALOG) {
    const item = g.items.find((i) => i.key === key)
    if (item) return item.label
  }
  return key
}

export function Roles() {
  const [roles, setRoles] = useState<RoleDef[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<RoleDef | 'new' | null>(null)
  const [deleting, setDeleting] = useState<RoleDef | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setRoles(await getRoles())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    setError(null)
    try {
      await deleteRole(deleting.key)
      setDeleting(null)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Roles"
        subtitle="Permission roles for your team"
        action={
          <Button className="w-auto" onClick={() => setEditing('new')}>
            <Plus size={18} /> Add role
          </Button>
        }
      />

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner />
      ) : roles.length === 0 ? (
        <EmptyState title="No roles" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.key}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <ShieldCheck size={16} className="text-brand-600" />
                  {r.label}
                </span>
                <Badge tone={r.area === 'manager' ? 'teal' : 'blue'}>
                  {r.area}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {r.permissions.length === 0 ? (
                  <span className="text-xs text-gray-400">No permissions</span>
                ) : (
                  r.permissions.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600"
                    >
                      {permissionLabel(p)}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {r.builtIn ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Lock size={12} /> Built-in
                  </span>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleting(r)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} /> Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoleModal
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={busy} className="ml-auto">
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Delete the{' '}
          <span className="font-medium text-gray-900">{deleting?.label}</span>{' '}
          role? You can’t delete a role that’s still assigned to someone.
        </p>
      </Modal>
    </PageContainer>
  )
}

function RoleModal({
  target,
  onClose,
  onSaved,
}: {
  target: RoleDef | 'new' | null
  onClose: () => void
  onSaved: () => void
}) {
  const open = target !== null
  const isNew = target === 'new'
  const role = isNew ? null : target

  const [label, setLabel] = useState('')
  const [area, setArea] = useState<Area>('employee')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setLabel(role?.label ?? '')
    setArea(role?.area ?? 'employee')
    setPermissions(role?.permissions ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  function togglePerm(p: Permission) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim()) {
      setError('Name is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (role) {
        await updateRole(role.key, { label: label.trim(), permissions })
      } else {
        await createRole({ label: label.trim(), area, permissions })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Add role' : 'Edit role'}
      footer={
        <Button type="submit" form="role-form" loading={busy} className="ml-auto">
          {isNew ? 'Create' : 'Save'}
        </Button>
      }
    >
      <form id="role-form" onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Role name"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Shift Lead"
          required
        />

        <Select
          label="Base experience"
          value={area}
          onChange={(e) => setArea(e.target.value as Area)}
          disabled={!isNew} // locked once created (it sets the landing page)
          options={[
            { value: 'manager', label: 'Desktop (admin-style home)' },
            { value: 'employee', label: 'Mobile (self-service home)' },
          ]}
        />

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Permissions
          </span>
          <p className="mb-2 text-xs text-gray-500">
            Pick any mix — these decide which pages and actions this role can use.
          </p>
          <div className="space-y-3">
            {PERMISSION_CATALOG.map((group) => (
              <div key={group.area}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {group.area === 'manager' ? 'Management' : 'Self-service'}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(item.key)}
                        onChange={() => togglePerm(item.key)}
                        className="mt-0.5 h-4 w-4 accent-brand-600"
                      />
                      <span>
                        <span className="block text-sm text-gray-900">{item.label}</span>
                        <span className="block text-xs text-gray-500">{item.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
