import { Bell, ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { AppIcon, appName, navItemForPath } from './navConfig'

// Top bar on mobile: back button (nested view) or logo, page title, bell.
export function MobileHeader({ className }: { className?: string }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  if (!user) return null

  const roots = ['/manager', '/employee']
  const match = navItemForPath(location.pathname)
  const pageTitle = match?.label ?? appName
  const canGoBack = !roots.includes(location.pathname) && !match

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-2',
        className,
      )}
    >
      <div className="flex w-12 justify-start">
        {canGoBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="grid h-11 w-11 place-items-center text-brand-600">
            <AppIcon size={22} />
          </div>
        )}
      </div>

      <h1 className="text-sm font-medium text-gray-900">{pageTitle}</h1>

      <div className="flex w-12 justify-end">
        <button
          aria-label="Notifications"
          className="grid h-11 w-11 place-items-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  )
}
