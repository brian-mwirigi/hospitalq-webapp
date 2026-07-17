import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { Layout } from '../components/Layout'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { ErrorBox } from '../components/ErrorBox'

export default function Login() {
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
    <Layout>
      <h1>Login</h1>
      <p className="muted">Use a seeded account (no register page).</p>

      <form className="box" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <ErrorBox message={error} />
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

      <div className="box box-plain" style={{ fontSize: 13, maxWidth: 420 }}>
        <h3>Demo accounts</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>reception@hospitalq.com / password123</li>
          <li>doctor@hospitalq.com / password123</li>
          <li>admin@hospitalq.com / password123</li>
        </ul>
      </div>
    </Layout>
  )
}
