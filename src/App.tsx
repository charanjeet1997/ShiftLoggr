import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { AnalyticsTracker } from './components/AnalyticsTracker'

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <AppRouter />
    </BrowserRouter>
  )
}
