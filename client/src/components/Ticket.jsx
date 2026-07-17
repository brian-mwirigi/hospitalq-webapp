import { formatTicketNumber } from '../formatters'

export function Ticket({ ticketNumber }) {
  return <div className="ticket">{formatTicketNumber(ticketNumber)}</div>
}