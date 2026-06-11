import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import NotesPage from './pages/NotesPage'
import PlannerPage from './pages/PlannerPage'
import DayHistoryPage from './pages/DayHistoryPage'
import Layout from './components/Layout'
import MizanMark from './components/MizanMark'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Mizan"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <MizanMark size={88} state="loading" animateIn={false} showText />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="history" element={<DayHistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
