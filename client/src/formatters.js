export function formatTicketNumber(ticketNumber, prefix) {
  if (prefix === undefined) {
    prefix = 'A'
  }

  if (ticketNumber === null || ticketNumber === undefined) {
    return ''
  }

  let num = String(ticketNumber)
  while (num.length < 3) {
    num = '0' + num
  }
  return prefix + num
}

export function formatPatientNamePrivate(fullName) {
  if (!fullName) {
    return ''
  }

  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return parts[0]
  }

  const first = parts[0]
  const last = parts[parts.length - 1]
  return first + ' ' + last.charAt(0).toUpperCase() + '.'
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return ''
  }
  const d = new Date(dateValue)
  return d.toLocaleString()
}

export function estimateWaitMinutes(positionInQueue, averageMinutes) {
  let pos = Number(positionInQueue)
  let avg = Number(averageMinutes)

  if (!pos) pos = 0
  if (!avg) avg = 10

  return pos * avg
}
