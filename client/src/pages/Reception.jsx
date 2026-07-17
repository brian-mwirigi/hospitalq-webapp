import { useEffect, useState } from 'react'
import { useDepts } from '../useDepts'
import {
  useAddPatient,
  useQueue,
  useQueueStats,
  useRemovePatient,
  useSkipPatient,
} from '../useQueue'
import { useRedirectSuggestion } from '../useStats'
import { useSocket } from '../useSocket'
import { Layout } from '../components/Layout'
import { PatientCard } from '../components/PatientCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Spinner } from '../components/Spinner'
import { ErrorBox } from '../components/ErrorBox'
import { ReconnectBar } from '../components/ReconnectBar'
import { formatTicketNumber } from '../formatters'

export default function Reception() {
  const deptsQuery = useDepts()
  const departments = deptsQuery.data || []

  const [deptId, setDeptId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (deptId === '' && departments.length > 0) {
      setDeptId(departments[0]._id)
    }
  }, [departments])

  const queueQuery = useQueue(deptId)
  const queue = queueQuery.data || []
  const statsQuery = useQueueStats(deptId)
  const stats = statsQuery.data
  const redirectQuery = useRedirectSuggestion(deptId)
  const redirectInfo = redirectQuery.data
  const socketStuff = useSocket(deptId)

  const addPatient = useAddPatient(deptId)
  const skipPatient = useSkipPatient(deptId)
  const removePatient = useRemovePatient(deptId)

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setMsg('')

    if (patientName.trim() === '' || deptId === '') {
      setError('Name and department required')
      return
    }

    try {
      const body = {
        patientName: patientName.trim(),
        department: deptId,
        priority: priority,
        notes: notes,
      }

      if (patientPhone.trim() !== '') {
        body.patientPhone = patientPhone.trim()
      }

      const entry = await addPatient.mutateAsync(body)

      setPatientName('')
      setPatientPhone('')
      setNotes('')
      setPriority('normal')

      let okText = 'Added ' + formatTicketNumber(entry.ticketNumber)
      if (patientPhone.trim() !== '') {
        okText = okText + ' (mock SMS saved)'
      }
      setMsg(okText)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Could not add patient')
      }
    }
  }

  function switchToQuieter() {
    if (redirectInfo && redirectInfo.quieterDepartment) {
      setDeptId(redirectInfo.quieterDepartment._id)
      setMsg('Switched to quieter dept: ' + redirectInfo.quieterDepartment.name)
    }
  }

  let total = 0
  let waiting = 0
  let done = 0
  let walkOuts = 0
  let predicted = 0
  let avgMin = 10

  if (stats) {
    total = stats.total || 0
    waiting = stats.waiting || 0
    done = stats.done || 0
    walkOuts = stats.walkOuts || 0
    predicted = stats.predictedWaitMinutes || 0
    avgMin = stats.avgWaitMinutes || 10
  }

  return (
    <Layout>
      {socketStuff.isReconnecting ? <ReconnectBar /> : null}

      <h1>Receptionist</h1>

      <div className="box">
        <label>
          Department
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            disabled={deptsQuery.isLoading}
          >
            {departments.map(function (d) {
              return (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              )
            })}
          </select>
        </label>
        <p>
          Total: {total} | Waiting: {waiting} | Done: {done} | Walk-outs: {walkOuts}
        </p>
        <p>
          Predicted wait: ~{predicted} min (avg consult {avgMin} min)
        </p>
      </div>

      {redirectInfo && redirectInfo.suggestRedirect && redirectInfo.quieterDepartment ? (
        <div className="box box-warn">
          <b>This dept looks busy</b>
          <p>
            Quieter option: {redirectInfo.quieterDepartment.name} (waiting:{' '}
            {redirectInfo.quieterDepartment.waiting})
          </p>
          <Button type="button" onClick={switchToQuieter}>
            Switch to quieter department
          </Button>
        </div>
      ) : null}

      <form className="box" onSubmit={handleAdd}>
        <h3>Add patient</h3>
        <ErrorBox message={error} />
        {msg !== '' ? <div className="ok">{msg}</div> : null}

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
      {queueQuery.isLoading ? (
        <Spinner />
      ) : queue.length === 0 ? (
        <p>No one in queue.</p>
      ) : (
        queue.map(function (entry) {
          let actions = null
          if (entry.status === 'waiting') {
            actions = (
              <>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={function () {
                    skipPatient.mutate(entry._id)
                  }}
                >
                  Skip
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  onClick={function () {
                    removePatient.mutate(entry._id)
                  }}
                >
                  Remove
                </Button>
              </>
            )
          }

          return <PatientCard key={entry._id} entry={entry} actions={actions} />
        })
      )}
    </Layout>
  )
}
