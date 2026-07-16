import { Navbar } from './Navbar'

export function PageWrapper({ children }) {
  return (
    <div>
      <Navbar />
      <div className="page">{children}</div>
    </div>
  )
}
