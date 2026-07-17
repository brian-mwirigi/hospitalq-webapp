export function Input({ label, error, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
      {error ? <div className="error">{error}</div> : null}
    </label>
  )
}
