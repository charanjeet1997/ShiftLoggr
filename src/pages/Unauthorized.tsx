import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Button } from '../components/ui'

export function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <ShieldX size={40} className="text-red-400" />
      <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
      <p className="max-w-xs text-sm text-gray-500">
        You don’t have permission to view this page.
      </p>
      <Link to="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </div>
  )
}
