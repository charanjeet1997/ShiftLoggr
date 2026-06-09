import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { BottomTabBar } from './BottomTabBar'

// Responsive layout wrapper.
// Desktop (lg+): fixed left sidebar + content offset by 200px.
// Mobile (<lg): sticky top header + bottom tab bar, content padded for both.
export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar className="hidden lg:flex" />
      <MobileHeader className="flex lg:hidden" />
      <main className="lg:ml-[200px] pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomTabBar className="flex lg:hidden" />
    </div>
  )
}
