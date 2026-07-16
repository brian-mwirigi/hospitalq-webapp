import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDepartments } from '../hooks/useDepartments'
import { PageWrapper } from '../components/layout/PageWrapper'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBanner } from '../components/ui/ErrorBanner'

export default function HomePage() {
  const { isAuthed, user } = useAuth()
  const { data: departments = [], isLoading, error } = useDepartments()

  let staffPath = '/receptionist'
  if (user?.role === 'doctor') staffPath = '/doctor'
  if (user?.role === 'admin') staffPath = '/admin'

  const loadError =
    error?.response?.data?.message ||
    (error ? 'Could not load departments. Is MongoDB connected?' : '')

  return (
    <PageWrapper>
      <h1>HospitalQ</h1>
      <p>Hospital queue system (class project)</p>

      <div className="box">
        {isAuthed ? (
          <p>
            Logged in as {user.name}. <Link to={staffPath}>Go to my page</Link>
          </p>
        ) : (
          <p>
            Staff: <Link to="/login">Login</Link>
          </p>
        )}
      </div>

      <h2>Patient boards</h2>
      <ErrorBanner message={loadError} />
      {isLoading ? (
        <LoadingSpinner />
      ) : departments.length === 0 && !error ? (
        <p>No departments yet. Run: npm run seed (in server folder)</p>
      ) : (
        <ul>
          {departments.map((d) => (
            <li key={d._id}>
              <Link to={`/queue/${d.slug}`}>{d.name}</Link> ({d.slug})
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  )
}
