import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { tabsForPermissions } from './navConfig'

// Mobile bottom nav. Safe-area aware for the iOS home bar. Hidden at lg+
// (parent applies `lg:hidden`).
export function BottomTabBar({ className }: { className?: string }) {
  const { user } = useAuth()
  const { permissions } = usePermissions()
  if (!user) return null
  const tabs = tabsForPermissions(permissions)

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around',
        'border-t border-gray-200 bg-white pb-safe',
        className,
      )}
    >
      {tabs.map(({ label, path, Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/manager' || path === '/employee'}
          className={({ isActive }) =>
            cn(
              'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs',
              isActive ? 'text-brand-600' : 'text-gray-500',
            )
          }
        >
          <Icon size={22} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
