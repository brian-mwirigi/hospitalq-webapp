import { formatTicketNumber } from '../../utils/formatters'

export function TicketDisplay({ ticketNumber }) {
  return <div className="ticket">{formatTicketNumber(ticketNumber)}</div>
}
