import { Link, useParams } from 'react-router-dom'
import { useDepartmentBySlug } from '../hooks/useDepartments'
import { useQueue, useQueueStats } from '../hooks/useQueue'
import { useRedirectSuggestion } from '../hooks/useAnalytics'
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
  const { data: stats } = useQueueStats(deptId)
  const { data: redirectInfo } = useRedirectSuggestion(deptId)
  const { isReconnecting } = useSocket(deptId)

  const current = queue.find((e) => e.status === 'in-progress') || null
  const waiting = queue.filter((e) => e.status === 'waiting')
  const avg = stats?.avgWaitMinutes || 10
  const predicted = stats?.predictedWaitMinutes ?? estimateWaitMinutes(waiting.length, avg)

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
          <p>People waiting</p>
          <div className="ticket">{waiting.length}</div>
          <p>
            <b>Predicted wait: ~{predicted} min</b>
          </p>
          <small style={{ color: '#6b7280' }}>
            simple estimate = waiting × avg last visits ({avg} min)
          </small>
        </div>

        {redirectInfo?.suggestRedirect && redirectInfo.quieterDepartment ? (
          <div className="box box-warn">
            <b>This department is busy</b>
            <p>
              Less busy:{' '}
              <Link to={`/queue/${redirectInfo.quieterDepartment.slug}`}>
                {redirectInfo.quieterDepartment.name}
              </Link>{' '}
              ({redirectInfo.quieterDepartment.waiting} waiting)
            </p>
            <small>Ask reception before switching.</small>
          </div>
        ) : null}

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

        <div className="box box-plain" style={{ marginTop: 16, fontSize: 13 }}>
          <b>Privacy</b>
          <p className="muted" style={{ marginBottom: 0 }}>
            Public board shows first name + last initial only. Full details stay with staff login.
          </p>
        </div>
      </div>
    </div>
  )
}
