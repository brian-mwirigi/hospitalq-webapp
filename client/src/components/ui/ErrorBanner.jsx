export function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="error">{message}</div>
}
