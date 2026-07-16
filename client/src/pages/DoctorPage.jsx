import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDepartments } from '../hooks/useDepartments'
import {
  useMarkDone,
  useMarkInProgress,
  useMarkNoShow,
  useQueue,
} from '../hooks/useQueue'
import { useSocket } from '../hooks/useSocket'
import { PageWrapper } from '../components/layout/PageWrapper'
import { QueueCard } from '../components/queue/QueueCard'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { ReconnectBanner } from '../components/ui/ReconnectBanner'
import { TicketDisplay } from '../components/ui/TicketDisplay'
import { Badge } from '../components/ui/Badge'

export default function DoctorPage() {
  const { user } = useAuth()
  const { data: departments = [] } = useDepartments()
  const [deptId, setDeptId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (deptId) return
    if (user?.department) {
      setDeptId(typeof user.department === 'string' ? user.department : user.department._id)
    } else if (departments[0]) {
      setDeptId(departments[0]._id)
    }
  }, [user, departments, deptId])

  const { data: queue = [], isLoading } = useQueue(deptId)
  const { isReconnecting } = useSocket(deptId)
  const markDone = useMarkDone(deptId)
  const markNoShow = useMarkNoShow(deptId)
  const markInProgress = useMarkInProgress(deptId)

  const current = queue.find((e) => e.status === 'in-progress') || null
  const waiting = queue.filter((e) => e.status === 'waiting')
  const next = waiting[0] || null

  async function doAction(mutation, id) {
    setError('')
    try {
      await mutation.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <PageWrapper>
      {isReconnecting ? <ReconnectBanner /> : null}

      <h1>Doctor</h1>

      <div className="box">
        <label>
          Department
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ErrorBanner message={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="box">
            <h3>Current patient</h3>
            {current ? (
              <>
                <TicketDisplay ticketNumber={current.ticketNumber} />
                <p>{current.patientName}</p>
                <Badge status="in-progress" />
              </>
            ) : (
              <p>Nobody in consultation.</p>
            )}
          </div>

          <div className="box">
            <h3>Next</h3>
            {next ? (
              <>
                <TicketDisplay ticketNumber={next.ticketNumber} />
                <p>{next.patientName}</p>
                <Button
                  type="button"
                  onClick={() => doAction(markInProgress, next._id)}
                  disabled={!!current || markInProgress.isPending}
                >
                  Call patient
                </Button>
              </>
            ) : (
              <p>No waiting patients.</p>
            )}
          </div>

          <div className="row" style={{ marginBottom: 12 }}>
            <Button
              type="button"
              onClick={() => current && doAction(markDone, current._id)}
              disabled={!current}
            >
              Mark done
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={() => current && doAction(markNoShow, current._id)}
              disabled={!current}
            >
              No-show
            </Button>
          </div>

          <h2>Waiting list</h2>
          {waiting.map((entry) => (
            <QueueCard key={entry._id} entry={entry} />
          ))}
        </>
      )}
    </PageWrapper>
  )
}
