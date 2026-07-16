import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { user, isAuthed, logout } = useAuth()

  return (
    <div className="nav">
      <Link to="/">HospitalQ</Link>
      <div className="row">
        {isAuthed && user ? (
          <>
            <span style={{ fontSize: 14 }}>
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
