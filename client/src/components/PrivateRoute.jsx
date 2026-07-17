import { Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { Spinner } from './Spinner'

export function PrivateRoute({ children, roles }) {
  const { isAuthed, user, isLoadingUser, token } = useAuth()

  if (token && isLoadingUser) {
    return (
      <div className="page">
        <Spinner />
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
