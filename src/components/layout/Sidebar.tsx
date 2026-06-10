import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { AppIcon, appName, navForPermissions } from './navConfig'

// Fixed 200px desktop sidebar. Hidden below lg (parent applies `hidden lg:flex`).
export function Sidebar({ className }: { className?: string }) {
  const { user, logout } = useAuth()
  const { permissions } = usePermissions()
  if (!user) return null
  const items = navForPermissions(permissions)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-[200px] flex-col border-r border-gray-200 bg-white',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <AppIcon className="text-brand-600" size={22} />
        <span className="font-semibold text-gray-900">{appName}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/manager' || path === '/employee'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {user.name}
          </p>
          <p className="text-xs capitalize text-gray-400">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
