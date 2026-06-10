import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'
import { AppIcon, appName } from '../components/layout/navConfig'

export function Login() {
  const { user, login, status, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Already signed in → let RootRedirect route to the right home by permission.
  if (user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  function quickFill(as: 'manager' | 'employee') {
    setEmail(as === 'manager' ? 'manager@shiftloggr.dev' : 'employee@shiftloggr.dev')
    setPassword('password')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
            <AppIcon size={26} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{appName}</h1>
          <p className="text-sm text-gray-500">Sign in to manage your shifts</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
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
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={status === 'loading'}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-3 text-center text-xs text-gray-500">
          <p className="mb-2 font-medium text-gray-600">Demo accounts</p>
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => quickFill('manager')}>
              Manager
            </Button>
            <Button size="sm" variant="secondary" onClick={() => quickFill('employee')}>
              Employee
            </Button>
          </div>
          <p className="mt-2 text-gray-400">password: <code>password</code></p>
        </div>
      </div>
    </div>
  )
}
