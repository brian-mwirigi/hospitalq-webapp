import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDepts } from '../hooks/useDepts'
import {
  useMarkDone,
  useMarkInProgress,
  useMarkNoShow,
  useQueue,
} from '../hooks/useQueue'
import { useSocket } from '../hooks/useSocket'
import { Layout } from '../components/layout/Layout'
import { PatientCard } from '../components/queue/PatientCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { ErrorBox } from '../components/ui/ErrorBox'
import { ReconnectBar } from '../components/ui/ReconnectBar'
import { Ticket } from '../components/ui/Ticket'
import { Badge } from '../components/ui/Badge'

export default function Doctor() {
  const auth = useAuth()
  const user = auth.user
  const deptsQuery = useDepts()
  const departments = deptsQuery.data || []

  const [deptId, setDeptId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (deptId !== '') return

    if (user && user.department) {
      if (typeof user.department === 'string') {
        setDeptId(user.department)
      } else {
        setDeptId(user.department._id)
      }
    } else if (departments.length > 0) {
      setDeptId(departments[0]._id)
    }
  }, [user, departments, deptId])

  const queueQuery = useQueue(deptId)
  const queue = queueQuery.data || []
  const socketStuff = useSocket(deptId)

  const markDone = useMarkDone(deptId)
  const markNoShow = useMarkNoShow(deptId)
  const markInProgress = useMarkInProgress(deptId)

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

  let next = null
  if (waiting.length > 0) {
    next = waiting[0]
  }

  async function clickDone() {
    if (!current) return
    setError('')
    try {
      await markDone.mutateAsync(current._id)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Action failed')
      }
    }
  }

  async function clickNoShow() {
    if (!current) return
    setError('')
    try {
      await markNoShow.mutateAsync(current._id)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Action failed')
      }
    }
  }

  async function clickCall() {
    if (!next) return
    setError('')
    try {
      await markInProgress.mutateAsync(next._id)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Action failed')
      }
    }
  }

  return (
    <Layout>
      {socketStuff.isReconnecting ? <ReconnectBar /> : null}

      <h1>Doctor</h1>

      <div className="box">
        <label>
          Department
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            {departments.map(function (d) {
              return (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              )
            })}
          </select>
        </label>
      </div>

      <ErrorBox message={error} />

      {queueQuery.isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="box">
            <h3>Current patient</h3>
            {current ? (
              <>
                <Ticket ticketNumber={current.ticketNumber} />
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
                <Ticket ticketNumber={next.ticketNumber} />
                <p>{next.patientName}</p>
                <Button
                  type="button"
                  onClick={clickCall}
                  disabled={current !== null || markInProgress.isPending}
                >
                  Call patient
                </Button>
              </>
            ) : (
              <p>No waiting patients.</p>
            )}
          </div>

          <div className="row" style={{ marginBottom: 12 }}>
            <Button type="button" onClick={clickDone} disabled={current === null}>
              Mark done
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={clickNoShow}
              disabled={current === null}
            >
              No-show
            </Button>
          </div>

          <h2>Waiting list</h2>
          {waiting.map(function (entry) {
            return <PatientCard key={entry._id} entry={entry} />
          })}
        </>
      )}
    </Layout>
  )
}
