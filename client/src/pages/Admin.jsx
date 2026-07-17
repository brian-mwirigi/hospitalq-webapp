import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDepts } from '../useDepts'
import { useBusyOverview, useSmsLogs } from '../useStats'
import api from '../api'
import { Layout } from '../components/Layout'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Spinner } from '../components/Spinner'
import { ErrorBox } from '../components/ErrorBox'

export default function Admin() {
  const queryClient = useQueryClient()
  const { data: departments = [], isLoading } = useDepts()
  const { data: overview, isLoading: loadingOverview } = useBusyOverview()
  const { data: smsLogs = [], isLoading: loadingSms } = useSmsLogs()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const createDept = useMutation({
    mutationFn: async (body) => {
      const res = await api.post('/departments', body)
      return res.data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })

  const deleteDept = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/departments/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      await createDept.mutateAsync({
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description,
      })
      setName('')
      setSlug('')
      setDescription('')
      setMsg('Created')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <Layout>
      <h1>Admin</h1>

      <div className="box">
        <h3>Today overview</h3>
        {loadingOverview ? (
          <Spinner />
        ) : (
          <>
            <p>
              Waiting: {overview?.totals?.waiting ?? 0} | Done: {overview?.totals?.done ?? 0} |
              Walk-outs (no-show): {overview?.totals?.walkOuts ?? 0}
            </p>
            {overview?.leastBusy ? (
              <p>
                Least busy now: <b>{overview.leastBusy.name}</b> (
                {overview.leastBusy.waiting} waiting)
              </p>
            ) : null}
            <table>
              <thead>
                <tr>
                  <th>Dept</th>
                  <th>Waiting</th>
                  <th>Done</th>
                  <th>Walk-outs</th>
                  <th>Pred. wait</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.departments || []).map((row) => (
                  <tr key={row.departmentId}>
                    <td>
                      {row.name} {row.busy ? '(busy)' : ''}
                    </td>
                    <td>{row.waiting}</td>
                    <td>{row.done}</td>
                    <td>{row.walkOuts}</td>
                    <td>~{row.predictedWaitMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="box">
        <h3>Mock SMS log</h3>
        <p style={{ fontSize: 13 }}>School version: SMS is saved here, not really sent.</p>
        {loadingSms ? (
          <Spinner />
        ) : smsLogs.length === 0 ? (
          <p>No SMS yet. Add a patient with a phone number.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>To</th>
                <th>Message</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {smsLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.to}</td>
                  <td style={{ fontSize: 12 }}>{log.message}</td>
                  <td style={{ fontSize: 12 }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="box" onSubmit={handleCreate}>
        <h3>Add department</h3>
        <ErrorBox message={error} />
        {msg ? <div className="ok">{msg}</div> : null}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit">Create</Button>
      </form>

      <h2>Departments</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>/queue/{d.slug}</td>
                <td>
                  <Button variant="danger" type="button" onClick={() => deleteDept.mutate(d._id)}>
                    Deactivate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  )
}
