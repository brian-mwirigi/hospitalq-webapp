import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { ErrorBanner } from '../components/ui/ErrorBanner'

export default function LoginPage() {
  const { login, isAuthed, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('reception@hospitalq.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthed && user) {
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/receptionist" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      if (data.user.role === 'doctor') navigate('/doctor')
      else if (data.user.role === 'admin') navigate('/admin')
      else navigate('/receptionist')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed (is the server / database running?)'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <h1>Login</h1>
      <p>There is no register page. Use the seeded accounts.</p>
      <form className="box" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <ErrorBanner message={error} />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </Button>
      </form>
      <div className="box" style={{ fontSize: 13 }}>
        <b>Demo accounts</b>
        <ul>
          <li>reception@hospitalq.com / password123</li>
          <li>doctor@hospitalq.com / password123</li>
          <li>admin@hospitalq.com / password123</li>
        </ul>
      </div>
    </PageWrapper>
  )
}
