import { Link, useParams } from 'react-router-dom'
import { useDepartmentBySlug } from '../hooks/useDepartments'
import { useQueue } from '../hooks/useQueue'
import { useSocket } from '../hooks/useSocket'
import {
  estimateWaitMinutes,
  formatPatientNamePrivate,
  formatTicketNumber,
} from '../utils/formatters'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { ReconnectBanner } from '../components/ui/ReconnectBanner'
import { TicketDisplay } from '../components/ui/TicketDisplay'
import { Badge } from '../components/ui/Badge'

export default function PatientQueuePage() {
  const { deptSlug } = useParams()
  const { data: department, isLoading: loadingDept, error } = useDepartmentBySlug(deptSlug)
  const deptId = department?._id

  const { data: queue = [], isLoading } = useQueue(deptId)
  const { isReconnecting } = useSocket(deptId)

  const current = queue.find((e) => e.status === 'in-progress') || null
  const waiting = queue.filter((e) => e.status === 'waiting')

  if (loadingDept) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !department) {
    return (
      <div className="page">
        <ErrorBanner message="Department not found" />
        <Link to="/">Back</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="nav">
        <span>HospitalQ - {department.name}</span>
        <Link to="/">Home</Link>
      </div>

      <div className="page">
        {isReconnecting ? <ReconnectBanner /> : null}

        <div className="box" style={{ textAlign: 'center' }}>
          <p>Waiting ahead</p>
          <div className="ticket">{waiting.length}</div>
          <p>Est. wait: {estimateWaitMinutes(waiting.length, 10)} min</p>
        </div>

        <div className="box">
          <h3>Now serving</h3>
          {current ? (
            <>
              <TicketDisplay ticketNumber={current.ticketNumber} />
              <p>{formatPatientNamePrivate(current.patientName)}</p>
              <Badge status="in-progress" />
            </>
          ) : (
            <p>No one right now</p>
          )}
        </div>

        <h3>Waiting list</h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : waiting.length === 0 ? (
          <p>Empty</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ticket</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {waiting.map((entry, i) => (
                <tr key={entry._id}>
                  <td>{i + 1}</td>
                  <td>{formatTicketNumber(entry.ticketNumber)}</td>
                  <td>{formatPatientNamePrivate(entry.patientName)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
