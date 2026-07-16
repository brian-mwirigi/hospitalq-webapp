import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'

export default function NotFound() {
  return (
    <Layout>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Go home</Link>
    </Layout>
  )
}
