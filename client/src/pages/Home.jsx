import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDepts } from '../hooks/useDepts'
import { Layout } from '../components/layout/Layout'
import { Spinner } from '../components/ui/Spinner'
import { ErrorBox } from '../components/ui/ErrorBox'

export default function Home() {
  const { isAuthed, user } = useAuth()
  const { data: departments = [], isLoading, error } = useDepts()

  let staffPath = '/receptionist'
  if (user?.role === 'doctor') staffPath = '/doctor'
  if (user?.role === 'admin') staffPath = '/admin'

  const loadError =
    error?.response?.data?.message ||
    (error ? 'Could not load departments. Is MongoDB connected?' : '')

  return (
    <Layout>
      <h1>HospitalQ</h1>
      <p className="muted">Hospital queue system — class project</p>

      <div className="box">
        {isAuthed ? (
          <p>
            Hi {user.name}. <Link to={staffPath}>Open my page</Link>
          </p>
        ) : (
          <p>
            Staff login: <Link to="/login">Login</Link>
          </p>
        )}
      </div>

      <div className="box box-plain" style={{ fontSize: 14 }}>
        <h3>What this app does</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Live queue for reception + doctor</li>
          <li>Patient board with predicted wait</li>
          <li>Suggests quieter department when busy</li>
          <li>Mock SMS if phone is entered</li>
          <li>Admin stats + walk-outs</li>
        </ul>
      </div>

      <h2>Patient boards</h2>
      <ErrorBox message={loadError} />
      {isLoading ? (
        <Spinner />
      ) : departments.length === 0 && !error ? (
        <p className="muted">No departments yet. Run seed in the server folder.</p>
      ) : (
        <ul className="dept-list">
          {departments.map((d) => (
            <li key={d._id}>
              <Link to={`/queue/${d.slug}`}>
                <b>{d.name}</b>
                <div className="muted">/queue/{d.slug}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
