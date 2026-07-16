import { Navbar } from './Navbar'

export function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="page">{children}</div>
    </div>
  )
}
