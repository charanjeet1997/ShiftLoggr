import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

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

// Send a logged-in user to their role's home; otherwise to login.
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Manager area */}
      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route element={<AppShell />}>
          <Route path="/manager" element={<Dashboard />} />
          <Route path="/manager/schedule" element={<Schedule />} />
          <Route path="/manager/swaps" element={<SwapRequests />} />
          <Route path="/manager/team" element={<Team />} />
          <Route path="/manager/geofence" element={<Geofence />} />
          <Route path="/manager/roles" element={<Roles />} />
        </Route>
      </Route>

      {/* Employee area */}
      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route element={<AppShell />}>
          <Route path="/employee" element={<MyShifts />} />
          <Route path="/employee/clock" element={<ClockIn />} />
          <Route path="/employee/swap" element={<RequestSwap />} />
          <Route path="/employee/requests" element={<SwapStatus />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
