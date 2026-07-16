import { useEffect, useState } from 'react'
import { useDepartments } from '../hooks/useDepartments'
import {
  useAddPatient,
  useQueue,
  useQueueStats,
  useRemovePatient,
  useSkipPatient,
} from '../hooks/useQueue'
import { useSocket } from '../hooks/useSocket'
import { PageWrapper } from '../components/layout/PageWrapper'
import { QueueCard } from '../components/queue/QueueCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { ReconnectBanner } from '../components/ui/ReconnectBanner'
import { formatTicketNumber } from '../utils/formatters'

export default function ReceptionistPage() {
  const { data: departments = [], isLoading: loadingDepts } = useDepartments()
  const [deptId, setDeptId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!deptId && departments[0]) setDeptId(departments[0]._id)
  }, [departments, deptId])

  // real api + live socket
  const { data: queue = [], isLoading } = useQueue(deptId)
  const { data: stats } = useQueueStats(deptId)
  const { isReconnecting } = useSocket(deptId)
  const addPatient = useAddPatient(deptId)
  const skipPatient = useSkipPatient(deptId)
  const removePatient = useRemovePatient(deptId)

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setMsg('')

    if (!patientName.trim() || !deptId) {
      setError('Name and department required')
      return
    }

    try {
      const entry = await addPatient.mutateAsync({
        patientName: patientName.trim(),
        department: deptId,
        priority,
        notes,
      })
      setPatientName('')
      setNotes('')
      setPriority('normal')
      setMsg(`Added ticket ${formatTicketNumber(entry.ticketNumber)}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add patient')
    }
  }

  return (
    <PageWrapper>
      {isReconnecting ? <ReconnectBanner /> : null}

      <h1>Receptionist</h1>

      <div className="box">
        <label>
          Department
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            disabled={loadingDepts}
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <p>
          Total: {stats?.total ?? 0} | Waiting: {stats?.waiting ?? 0} | Done: {stats?.done ?? 0}
        </p>
      </div>

      <form className="box" onSubmit={handleAdd}>
        <h3>Add patient</h3>
        <ErrorBanner message={error} />
        {msg ? <div className="ok">{msg}</div> : null}
        <Input
          label="Patient name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
        />
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="normal">normal</option>
            <option value="urgent">urgent</option>
          </select>
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
        <Button type="submit" disabled={addPatient.isPending}>
          {addPatient.isPending ? 'Adding...' : 'Add to queue'}
        </Button>
      </form>

      <h2>Queue</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : queue.length === 0 ? (
        <p>No one in queue.</p>
      ) : (
        queue.map((entry) => (
          <QueueCard
            key={entry._id}
            entry={entry}
            actions={
              entry.status === 'waiting' ? (
                <>
                  <Button variant="ghost" type="button" onClick={() => skipPatient.mutate(entry._id)}>
                    Skip
                  </Button>
                  <Button variant="danger" type="button" onClick={() => removePatient.mutate(entry._id)}>
                    Remove
                  </Button>
                </>
              ) : null
            }
          />
        ))
      )}
    </PageWrapper>
  )
}
