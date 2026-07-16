import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { user, isAuthed, logout } = useAuth()

  return (
    <div className="nav">
      <Link to="/">HospitalQ</Link>
      <div className="nav-links">
        {isAuthed && user ? (
          <>
            {user.role === 'receptionist' || user.role === 'admin' ? (
              <Link to="/receptionist">Reception</Link>
            ) : null}
            {user.role === 'doctor' || user.role === 'admin' ? (
              <Link to="/doctor">Doctor</Link>
            ) : null}
            {user.role === 'admin' ? <Link to="/admin">Admin</Link> : null}
            <span style={{ opacity: 0.9 }}>
              {user.name} ({user.role})
            </span>
            <button className="btn btn-gray" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  )
}
