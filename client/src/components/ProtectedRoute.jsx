import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from './ui/LoadingSpinner'

export function ProtectedRoute({ children, roles }) {
  const { isAuthed, user, isLoadingUser, token } = useAuth()

  if (token && isLoadingUser) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthed || !user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/receptionist" replace />
  }

  return children
}
