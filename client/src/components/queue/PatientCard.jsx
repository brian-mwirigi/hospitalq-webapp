import { Badge } from '../ui/Badge'
import { Ticket } from '../ui/Ticket'

export function PatientCard({ entry, privateName = false, actions }) {
  if (!entry) return null

  let name = entry.patientName || ''
  if (privateName) {
    const parts = name.trim().split(/\s+/)
    name = parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
  }

  return (
    <div className="box">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <Ticket ticketNumber={entry.ticketNumber} />
          <div>{name}</div>
          <div style={{ marginTop: 4 }}>
            <Badge status={entry.status} />{' '}
            {entry.priority === 'urgent' ? <b style={{ color: '#f4a261' }}>URGENT</b> : null}
          </div>
          {entry.notes ? <small style={{ color: '#6b7280' }}>{entry.notes}</small> : null}
        </div>
        {actions ? <div className="row">{actions}</div> : null}
      </div>
    </div>
  )
}
