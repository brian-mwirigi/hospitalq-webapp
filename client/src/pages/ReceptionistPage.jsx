import { useEffect, useState } from 'react'
import { useDepartments } from '../hooks/useDepartments'
import {
  useAddPatient,
  useQueue,
  useQueueStats,
  useRemovePatient,
  useSkipPatient,
} from '../hooks/useQueue'
import { useRedirectSuggestion } from '../hooks/useAnalytics'
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
  const [patientPhone, setPatientPhone] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!deptId && departments[0]) setDeptId(departments[0]._id)
  }, [departments, deptId])

  const { data: queue = [], isLoading } = useQueue(deptId)
  const { data: stats } = useQueueStats(deptId)
  const { data: redirectInfo } = useRedirectSuggestion(deptId)
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
        patientPhone: patientPhone.trim() || undefined,
      })
      setPatientName('')
      setPatientPhone('')
      setNotes('')
      setPriority('normal')
      setMsg(
        `Added ${formatTicketNumber(entry.ticketNumber)}` +
          (patientPhone.trim() ? ' (mock SMS saved)' : '')
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add patient')
    }
  }

  function useQuieterDept() {
    if (redirectInfo?.quieterDepartment?._id) {
      setDeptId(redirectInfo.quieterDepartment._id)
      setMsg(`Switched to quieter dept: ${redirectInfo.quieterDepartment.name}`)
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
          Total: {stats?.total ?? 0} | Waiting: {stats?.waiting ?? 0} | Done: {stats?.done ?? 0} |
          Walk-outs: {stats?.walkOuts ?? 0}
        </p>
        <p>
          Predicted wait: ~{stats?.predictedWaitMinutes ?? 0} min (avg consult{' '}
          {stats?.avgWaitMinutes ?? 10} min)
        </p>
      </div>

      {redirectInfo?.suggestRedirect && redirectInfo.quieterDepartment ? (
        <div className="box box-warn">
          <b>This dept looks busy</b>
          <p>
            Quieter option: {redirectInfo.quieterDepartment.name} (waiting:{' '}
            {redirectInfo.quieterDepartment.waiting})
          </p>
          <Button type="button" onClick={useQuieterDept}>
            Switch to quieter department
          </Button>
        </div>
      ) : null}

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
        <Input
          label="Phone (optional - mock SMS)"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
          placeholder="0712345678"
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
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => removePatient.mutate(entry._id)}
                  >
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
