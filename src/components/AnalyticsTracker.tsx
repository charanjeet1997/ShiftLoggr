import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { track } from '../firebase'

// Logs a `page_view` on every route change. Renders nothing.
// Must live inside <BrowserRouter>.
export function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    track('page_view', {
      page_path: location.pathname,
      page_location: window.location.href,
    })
  }, [location.pathname])

  return null
}
