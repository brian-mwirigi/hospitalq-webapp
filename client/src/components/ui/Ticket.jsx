import { formatTicketNumber } from '../../utils/formatters'

export function Ticket({ ticketNumber }) {
  return <div className="ticket">{formatTicketNumber(ticketNumber)}</div>
}
