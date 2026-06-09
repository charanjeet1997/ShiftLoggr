import type { Area, Permission, RoleDef } from '../types'

// Catalogue of permissions, grouped by area — drives the Roles admin checkboxes.
export const PERMISSION_CATALOG: {
  area: Area
  items: { key: Permission; label: string; desc: string }[]
}[] = [
  {
    area: 'manager',
    items: [
      { key: 'view_dashboard', label: 'Dashboard', desc: 'View the manager dashboard' },
      { key: 'manage_shifts', label: 'Manage schedule', desc: 'Create, edit and delete shifts' },
      { key: 'approve_swaps', label: 'Approve swaps', desc: 'Approve or reject swap requests' },
      { key: 'manage_team', label: 'Manage team', desc: 'View the team roster' },
      { key: 'manage_geofence', label: 'Manage geofence', desc: 'Create and edit location zones' },
      { key: 'manage_roles', label: 'Manage roles', desc: 'Create and edit custom roles' },
    ],
  },
  {
    area: 'employee',
    items: [
      { key: 'view_own_shifts', label: 'My shifts', desc: 'View own shifts and requests' },
      { key: 'clock', label: 'Clock in/out', desc: 'Clock in and out of shifts' },
      { key: 'request_swap', label: 'Request swaps', desc: 'Submit shift swap requests' },
    ],
  },
]

export function permissionsForArea(area: Area): Permission[] {
  return PERMISSION_CATALOG.find((g) => g.area === area)!.items.map((i) => i.key)
}

// Built-in roles — always present, cannot be edited or deleted.
export const BUILTIN_ROLES: RoleDef[] = [
  {
    key: 'manager',
    label: 'Manager',
    area: 'manager',
    permissions: permissionsForArea('manager'),
    builtIn: true,
  },
  {
    key: 'employee',
    label: 'Employee',
    area: 'employee',
    permissions: permissionsForArea('employee'),
    builtIn: true,
  },
]

// Area fallback for built-ins so routing works before the roles list loads.
export function builtInArea(roleKey: string): Area {
  return roleKey === 'manager' ? 'manager' : 'employee'
}
