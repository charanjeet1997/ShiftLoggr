// Shared domain types — mirror the Firestore collections in the spec.

// A role is identified by a string key. 'manager' and 'employee' are built in;
// custom roles add their own keys.
export type Role = string

// Which area (layout, route tree, backend authorization) a role belongs to.
export type Area = 'manager' | 'employee'

// Fine-grained capabilities a role may grant within its area.
export type Permission =
  // manager-area
  | 'view_dashboard'
  | 'manage_shifts'
  | 'approve_swaps'
  | 'manage_team'
  | 'manage_geofence'
  | 'manage_roles'
  // employee-area
  | 'view_own_shifts'
  | 'clock'
  | 'request_swap'

export interface RoleDef {
  key: string
  label: string
  area: Area
  permissions: Permission[]
  builtIn: boolean
}

export type ShiftStatus = 'scheduled' | 'active' | 'done'
export type ShiftRepeat = 'none' | 'weekly' | 'fortnightly'

export type SwapStatus = 'pending' | 'approved' | 'rejected'

export type ClockType = 'in' | 'out'

export interface User {
  uid: string
  name: string
  email: string
  role: Role
  locationId: string
  createdAt: string // ISO string (Firestore timestamp on the server)
}

export interface Shift {
  shiftId: string
  userId: string | null // null = open shift, claimable by any employee
  locationId: string
  startTime: string // ISO
  endTime: string // ISO
  role: string // e.g. 'Operator', 'Supervisor'
  status: ShiftStatus
  repeat: ShiftRepeat
  createdAt: string
}

export interface SwapRequest {
  requestId: string
  requesterId: string
  targetId: string
  requesterShiftId: string
  targetShiftId: string
  reason: string | null
  status: SwapStatus
  createdAt: string
  resolvedAt: string | null
}

// An employee's claim on an open shift, pending manager approval.
export interface OpenShiftRequest {
  requestId: string
  shiftId: string
  userId: string
  status: SwapStatus
  createdAt: string
  resolvedAt: string | null
}

export interface Location {
  locationId: string
  name: string
  lat: number
  lng: number
  radiusMeters: number
}

export interface ClockLog {
  logId: string
  userId: string
  shiftId: string
  type: ClockType
  lat: number
  lng: number
  distanceFromZone: number
  valid: boolean
  timestamp: string
}

// ---- Auth payloads ----

export interface AuthUser {
  uid: string
  name: string
  role: Role
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// ---- Clock payloads ----

export interface ClockPayload {
  shiftId: string
  type: ClockType
  // Optional — when omitted, the server skips geofence validation.
  lat?: number
  lng?: number
}

export interface ClockResult {
  valid: boolean
  message: string
  distanceFromZone: number
  log: ClockLog
}
