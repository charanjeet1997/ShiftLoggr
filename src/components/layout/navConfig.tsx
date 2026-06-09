import {
  CalendarDays,
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
import type { Role } from '../../types'

export interface NavItem {
  label: string
  path: string
  Icon: LucideIcon
  /** Show in the mobile bottom tab bar (max 5). */
  tab?: boolean
}

const managerNav: NavItem[] = [
  { label: 'Dashboard', path: '/manager', Icon: LayoutDashboard, tab: true },
  { label: 'Schedule', path: '/manager/schedule', Icon: CalendarDays, tab: true },
  { label: 'Swaps', path: '/manager/swaps', Icon: Repeat, tab: true },
  { label: 'Team', path: '/manager/team', Icon: Users, tab: true },
  { label: 'Geofence', path: '/manager/geofence', Icon: MapPin },
  { label: 'Roles', path: '/manager/roles', Icon: ShieldCheck },
]

const employeeNav: NavItem[] = [
  { label: 'My Shifts', path: '/employee', Icon: CalendarDays, tab: true },
  { label: 'Clock In', path: '/employee/clock', Icon: Clock, tab: true },
  { label: 'Swap', path: '/employee/swap', Icon: Repeat, tab: true },
  { label: 'Requests', path: '/employee/requests', Icon: ListChecks, tab: true },
]

export function navForRole(role: Role): NavItem[] {
  return role === 'manager' ? managerNav : employeeNav
}

export function tabsForRole(role: Role): NavItem[] {
  return navForRole(role)
    .filter((i) => i.tab)
    .slice(0, 5)
}

export const appName = 'ShiftLoggr'
export const AppIcon = ClipboardList
