import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Repeat,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Permission } from '../../types'

export interface NavItem {
  label: string
  path: string
  Icon: LucideIcon
  permission: Permission
  /** Eligible for the mobile bottom tab bar (max 5 shown). */
  tab?: boolean
}

// One flat list of every destination, each gated by a single permission.
// A user sees exactly the items whose permission their role grants.
const ALL_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/manager', Icon: LayoutDashboard, permission: 'view_dashboard', tab: true },
  { label: 'Schedule', path: '/manager/schedule', Icon: CalendarDays, permission: 'manage_shifts', tab: true },
  { label: 'Swaps', path: '/manager/swaps', Icon: Repeat, permission: 'approve_swaps', tab: true },
  { label: 'Team', path: '/manager/team', Icon: Users, permission: 'manage_team', tab: true },
  { label: 'Geofence', path: '/manager/geofence', Icon: MapPin, permission: 'manage_geofence' },
  { label: 'Roles', path: '/manager/roles', Icon: ShieldCheck, permission: 'manage_roles' },
  { label: 'My Shifts', path: '/employee', Icon: CalendarDays, permission: 'view_own_shifts', tab: true },
  { label: 'Open Shifts', path: '/employee/open', Icon: CalendarPlus, permission: 'view_own_shifts', tab: true },
  { label: 'Clock In', path: '/employee/clock', Icon: Clock, permission: 'clock', tab: true },
  { label: 'Swap', path: '/employee/swap', Icon: Repeat, permission: 'request_swap', tab: true },
  { label: 'Requests', path: '/employee/requests', Icon: ListChecks, permission: 'request_swap' },
]

export function navForPermissions(perms: Permission[]): NavItem[] {
  return ALL_NAV.filter((i) => perms.includes(i.permission))
}

export function tabsForPermissions(perms: Permission[]): NavItem[] {
  return navForPermissions(perms)
    .filter((i) => i.tab)
    .slice(0, 5)
}

// Where to land a user: their first permitted destination.
export function homePathForPermissions(perms: Permission[]): string {
  return navForPermissions(perms)[0]?.path ?? '/unauthorized'
}

export function navItemForPath(path: string): NavItem | undefined {
  return ALL_NAV.find((i) => i.path === path)
}

export const appName = 'ShiftLoggr'
export const AppIcon = ClipboardList
