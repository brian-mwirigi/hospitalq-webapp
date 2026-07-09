export function formatTicketNumber(ticketNumber, prefix = 'A') {
  if (ticketNumber === null || ticketNumber === undefined) {
    return '';
  }
  const padded = String(ticketNumber).padStart(3, '0');
  return `${prefix}${padded}`;
}

export function formatPatientNamePrivate(fullName) {
  if (!fullName) {
    return '';
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString();
}

export function estimateWaitMinutes(positionInQueue, averageMinutes = 10) {
  const position = Number(positionInQueue) || 0;
  const avg = Number(averageMinutes) || 10;
  return position * avg;
}
