const classMap = {
  waiting: 'badge badge-waiting',
  'in-progress': 'badge badge-progress',
  done: 'badge badge-done',
  'no-show': 'badge badge-noshow',
  skipped: 'badge badge-skipped',
}

export function Badge({ status = 'waiting', children }) {
  return <span className={classMap[status] || classMap.waiting}>{children || status}</span>
}
