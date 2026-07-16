import { Link, useParams } from 'react-router-dom'
import { useDeptBySlug } from '../hooks/useDepts'
import { useQueue, useQueueStats } from '../hooks/useQueue'
import { useRedirectSuggestion } from '../hooks/useStats'
import { useSocket } from '../hooks/useSocket'
import {
  estimateWaitMinutes,
  formatPatientNamePrivate,
  formatTicketNumber,
} from '../utils/formatters'
import { Spinner } from '../components/ui/Spinner'
import { ErrorBox } from '../components/ui/ErrorBox'
import { ReconnectBar } from '../components/ui/ReconnectBar'
import { Ticket } from '../components/ui/Ticket'
import { Badge } from '../components/ui/Badge'

export default function QueueBoard() {
  const params = useParams()
  const deptSlug = params.deptSlug

  const deptQuery = useDeptBySlug(deptSlug)
  const department = deptQuery.data
  const deptId = department ? department._id : null

  const queueQuery = useQueue(deptId)
  const queue = queueQuery.data || []
  const statsQuery = useQueueStats(deptId)
  const stats = statsQuery.data
  const redirectQuery = useRedirectSuggestion(deptId)
  const redirectInfo = redirectQuery.data
  const socketStuff = useSocket(deptId)

  let current = null
  let waiting = []

  for (let i = 0; i < queue.length; i++) {
    if (queue[i].status === 'in-progress') {
      current = queue[i]
    }
    if (queue[i].status === 'waiting') {
      waiting.push(queue[i])
    }
  }

  let avg = 10
  if (stats && stats.avgWaitMinutes) {
    avg = stats.avgWaitMinutes
  }

  let predicted = estimateWaitMinutes(waiting.length, avg)
  if (stats && stats.predictedWaitMinutes !== undefined) {
    predicted = stats.predictedWaitMinutes
  }

  if (deptQuery.isLoading) {
    return (
      <div className="page">
        <Spinner />
      </div>
    )
  }

  if (deptQuery.error || !department) {
    return (
      <div className="page">
        <ErrorBox message="Department not found" />
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
        {socketStuff.isReconnecting ? <ReconnectBar /> : null}

        <div className="box" style={{ textAlign: 'center' }}>
          <p>People waiting</p>
          <div className="ticket">{waiting.length}</div>
          <p>
            <b>Predicted wait: ~{predicted} min</b>
          </p>
          <small className="muted">
            estimate = waiting x avg last visits ({avg} min)
          </small>
        </div>

        {redirectInfo && redirectInfo.suggestRedirect && redirectInfo.quieterDepartment ? (
          <div className="box box-warn">
            <b>This department is busy</b>
            <p>
              Less busy:{' '}
              <Link to={'/queue/' + redirectInfo.quieterDepartment.slug}>
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
              <Ticket ticketNumber={current.ticketNumber} />
              <p>{formatPatientNamePrivate(current.patientName)}</p>
              <Badge status="in-progress" />
            </>
          ) : (
            <p>No one right now</p>
          )}
        </div>

        <h3>Waiting list</h3>
        {queueQuery.isLoading ? (
          <Spinner />
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
              {waiting.map(function (entry, i) {
                return (
                  <tr key={entry._id}>
                    <td>{i + 1}</td>
                    <td>{formatTicketNumber(entry.ticketNumber)}</td>
                    <td>{formatPatientNamePrivate(entry.patientName)}</td>
                  </tr>
                )
              })}
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
