import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Go home</Link>
    </PageWrapper>
  )
}
