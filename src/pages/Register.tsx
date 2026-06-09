import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Briefcase, UserCog } from 'lucide-react'
import type { Role } from '../types'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'
import { AppIcon, appName } from '../components/layout/navConfig'
import { cn } from '../utils/cn'

// Role = the permission level granted to the new account.
const roles: { value: Role; label: string; desc: string; Icon: typeof Briefcase }[] = [
  {
    value: 'employee',
    label: 'Employee',
    desc: 'View shifts, clock in/out, request swaps',
    Icon: Briefcase,
  },
  {
    value: 'manager',
    label: 'Manager',
    desc: 'Manage schedules, team, swaps & geofence zones',
    Icon: UserCog,
  },
]

export function Register() {
  const { user, register, status, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<Role>('employee')
  const [localError, setLocalError] = useState<string | null>(null)

  if (user) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setLocalError(null)
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match')
      return
    }
    try {
      const u = await register({ name, email, password, role })
      navigate(u.role === 'manager' ? '/manager' : '/employee', { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
            <AppIcon size={26} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create your {appName} account</h1>
          <p className="text-sm text-gray-500">Set up access in a few seconds</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {/* Permission / role selector */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Account permission
            </span>
            <div className="grid grid-cols-1 gap-2">
              {roles.map(({ value, label, desc, Icon }) => {
                const active = role === value
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRole(value)}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg',
                        active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {label}
                      </span>
                      <span className="block text-xs text-gray-500">{desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {(localError || error) && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {localError || error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={status === 'loading'}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
