export function Button({ variant = 'primary', className = '', children, ...props }) {
  let extra = 'btn'
  if (variant === 'danger') extra += ' btn-red'
  if (variant === 'ghost' || variant === 'secondary') extra += ' btn-gray'

  return (
    <button className={`${extra} ${className}`} {...props}>
      {children}
    </button>
  )
}
