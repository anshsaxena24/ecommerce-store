import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { token, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
