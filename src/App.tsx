import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { AnalyticsTracker } from './components/AnalyticsTracker'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AnalyticsTracker />
      <AppRouter />
    </BrowserRouter>
  )
}
