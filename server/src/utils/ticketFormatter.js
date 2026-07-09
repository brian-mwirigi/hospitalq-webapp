export function formatTicket(ticketNumber, prefix = 'A') {
  const padded = String(ticketNumber).padStart(3, '0');
  return `${prefix}${padded}`;
}

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getStartOfDayUTC() {
  const today = getTodayDateString();
  return new Date(`${today}T00:00:00.000Z`);
}
