export function Input({ label, className = '', ...props }) {
  return (
    <label className="block w-full">
      {label && <span className="mb-2 block text-sm font-medium text-gray3">{label}</span>}
      <input
        className={`w-full rounded-xl border border-gray2 bg-white px-4 py-3 text-sm text-gray3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        {...props}
      />
    </label>
  )
}
