import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Guard, RequireAuth, RootRedirect } from './ProtectedRoute'

import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Unauthorized } from '../pages/Unauthorized'

import { Dashboard } from '../pages/manager/Dashboard'
import { Schedule } from '../pages/manager/Schedule'
import { SwapRequests } from '../pages/manager/SwapRequests'
import { Team } from '../pages/manager/Team'
import { Geofence } from '../pages/manager/Geofence'
import { Roles } from '../pages/manager/Roles'

import { MyShifts } from '../pages/employee/MyShifts'
import { ClockIn } from '../pages/employee/ClockIn'
import { RequestSwap } from '../pages/employee/RequestSwap'
import { SwapStatus } from '../pages/employee/SwapStatus'

// All pages live under one shell now; access is gated per-page by permission
// rather than by a fixed manager/employee area.
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/manager" element={<Guard permission="view_dashboard"><Dashboard /></Guard>} />
          <Route path="/manager/schedule" element={<Guard permission="manage_shifts"><Schedule /></Guard>} />
          <Route path="/manager/swaps" element={<Guard permission="approve_swaps"><SwapRequests /></Guard>} />
          <Route path="/manager/team" element={<Guard permission="manage_team"><Team /></Guard>} />
          <Route path="/manager/geofence" element={<Guard permission="manage_geofence"><Geofence /></Guard>} />
          <Route path="/manager/roles" element={<Guard permission="manage_roles"><Roles /></Guard>} />

          <Route path="/employee" element={<Guard permission="view_own_shifts"><MyShifts /></Guard>} />
          <Route path="/employee/clock" element={<Guard permission="clock"><ClockIn /></Guard>} />
          <Route path="/employee/swap" element={<Guard permission="request_swap"><RequestSwap /></Guard>} />
          <Route path="/employee/requests" element={<Guard permission="request_swap"><SwapStatus /></Guard>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
