export function Badge({ status = 'waiting', className = '', children, ...props }) {
  const statusStyles = {
    waiting: 'bg-warning/15 text-warning border border-warning/30',
    'in-progress': 'bg-secondary/15 text-secondary border border-secondary/30',
    done: 'bg-success/15 text-success border border-success/30',
    'no-show': 'bg-danger/15 text-danger border border-danger/30',
    skipped: 'bg-gray1 text-gray3 border border-gray2',
  }

  return (
    <span
      className={['inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[status] ?? statusStyles.waiting, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
