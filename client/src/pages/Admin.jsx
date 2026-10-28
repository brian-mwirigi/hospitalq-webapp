import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDepts } from '../useDepts'
import { useBusyOverview, useSmsLogs } from '../useStats'
import api from '../api'
import { searchWorkers, getWorker, createBooking, getBooking } from '../quickfundiApi.js'

function defaultBookWhen() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`
}
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
  const [jobType, setJobType] = useState('electrician')
  const [location, setLocation] = useState('Nairobi')
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [bookSite, setBookSite] = useState('Nairobi Hospital, Ward 4')
  const [bookWhen, setBookWhen] = useState(defaultBookWhen)
  const [requestedBy, setRequestedBy] = useState('HospitalQ Facilities Desk')
  const [fundiBookError, setFundiBookError] = useState('')
  const [lastBooking, setLastBooking] = useState(null)
  const [verifiedBooking, setVerifiedBooking] = useState(null)
  const [verifyError, setVerifyError] = useState('')
  const [verifyingBooking, setVerifyingBooking] = useState(false)

  const {
    data: fundiWorkers = [],
    isLoading: loadingFundi,
    error: fundiError,
    refetch: refetchFundi,
    isFetching: fetchingFundi,
  } = useQuery({
    queryKey: ['quickfundi', 'workers', jobType, location],
    queryFn: () => searchWorkers(jobType, location),
  })

  const { data: fundiProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['quickfundi', 'worker', selectedWorkerId],
    queryFn: () => getWorker(selectedWorkerId),
    enabled: selectedWorkerId !== '',
  })

  const bookFundi = useMutation({
    mutationFn: createBooking,
  })

  async function handleBookFundi(e) {
    e.preventDefault()
    setFundiBookError('')
    setLastBooking(null)
    setVerifiedBooking(null)
    setVerifyError('')
    if (!fundiProfile) return

    const when = new Date(bookWhen)
    if (Number.isNaN(when.getTime())) {
      setFundiBookError('Pick a valid date and time.')
      return
    }

    try {
      const res = await bookFundi.mutateAsync({
        workerId: fundiProfile.id,
        jobType: fundiProfile.jobType,
        location: bookSite.trim(),
        scheduledFor: when.toISOString(),
        requestedBy: requestedBy.trim(),
      })
      setLastBooking(res.data)
      setVerifiedBooking(null)
      setVerifyError('')
    } catch (err) {
      setFundiBookError(err.response?.data?.message || 'Booking failed')
    }
  }

  async function handleVerifyBooking() {
    if (!lastBooking?.id) return
    setVerifyError('')
    setVerifiedBooking(null)
    setVerifyingBooking(true)
    try {
      const data = await getBooking(lastBooking.id)
      setVerifiedBooking(data)
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Could not load booking')
    } finally {
      setVerifyingBooking(false)
    }
  }

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

  const site = window.location.origin
  const qf = 'https://team12-webapp-production.up.railway.app'

  return (
    <Layout>
      <h1>Admin</h1>

      <div className="box">
        <h3>Open JSON in browser</h3>
        <p style={{ fontSize: 13 }}>
          Click — new tab shows the response (Chrome/Edge usually pretty-prints JSON). POST/login
          stuff is on <a href={`${site}/docs`}>/docs</a> instead.
        </p>
        <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
          <li>
            <a href={`${site}/api/departments`} target="_blank" rel="noreferrer">
              Our departments (Team 1 uses this)
            </a>
          </li>
          <li>
            <a href={`${site}/docs`} target="_blank" rel="noreferrer">
              Our API docs (Swagger)
            </a>
          </li>
          <li>
            <a href={qf} target="_blank" rel="noreferrer">
              QuickFundi ping
            </a>
          </li>
          <li>
            <a
              href={`${qf}/workers?jobType=plumber&location=Nairobi`}
              target="_blank"
              rel="noreferrer"
            >
              QuickFundi plumbers in Nairobi
            </a>
          </li>
          <li>
            <a href={`${qf}/workers/wk_1043`} target="_blank" rel="noreferrer">
              QuickFundi worker wk_1043
            </a>
          </li>
        </ul>
      </div>

      <div className="box">
        <h3>Today overview</h3>
        {loadingOverview ? (
          <Spinner />
        ) : (
          <>
            <p>
              Waiting: {overview?.totals?.waiting ?? 0} | Done: {overview?.totals?.done ?? 0}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Dept</th>
                  <th>Waiting</th>
                  <th>Avg consult</th>
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
                    <td>{row.avgConsultMinutes} min</td>
                    <td>~{row.predictedWaitMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="box">
        <h3>QuickFundi (Team 12)</h3>
        <p style={{ fontSize: 13 }}>
          Live fundis from their Railway API. We call them through our backend so the browser
          does not hit CORS issues.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label>
            Job type
            <select
              value={jobType}
              onChange={(e) => {
                setSelectedWorkerId('')
                setJobType(e.target.value)
              }}
              style={{ display: 'block', marginTop: 4, minWidth: 140 }}
            >
              <option value="electrician">electrician</option>
              <option value="plumber">plumber</option>
              <option value="handyman">handyman</option>
            </select>
          </label>
          <Input
            label="Location"
            value={location}
            onChange={(e) => {
              setSelectedWorkerId('')
              setLocation(e.target.value)
            }}
          />
          <Button type="button" onClick={() => refetchFundi()} disabled={fetchingFundi}>
            {fetchingFundi ? 'Loading...' : 'Search'}
          </Button>
        </div>

        {fundiError ? (
          <ErrorBox
            message={
              fundiError.response?.data?.message ||
              fundiError.message ||
              'Could not load QuickFundi workers'
            }
          />
        ) : null}

        {loadingFundi ? (
          <Spinner />
        ) : fundiWorkers.length === 0 ? (
          <p>No workers came back. Try another location or job type.</p>
        ) : (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Area</th>
                <th>Rating</th>
                <th>KES/hr</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fundiWorkers.map((w) => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.jobType}</td>
                  <td>{w.location}</td>
                  <td>{w.rating}</td>
                  <td>{w.ratePerHour}</td>
                  <td>
                    <Button type="button" onClick={() => setSelectedWorkerId(w.id)}>
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedWorkerId ? (
          <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Worker profile</h4>
            {loadingProfile ? (
              <Spinner />
            ) : fundiProfile ? (
              <>
                <p>
                  <strong>{fundiProfile.name}</strong> ({fundiProfile.id}) — {fundiProfile.jobType}
                </p>
                <p style={{ margin: '4px 0' }}>
                  {fundiProfile.location} · {fundiProfile.experienceYears} yrs · rating{' '}
                  {fundiProfile.rating} · KES {fundiProfile.ratePerHour}/hr
                </p>
                {(fundiProfile.reviews || []).length === 0 ? (
                  <p style={{ fontSize: 13 }}>No reviews in their API response.</p>
                ) : (
                  <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                    {fundiProfile.reviews.map((r, i) => (
                      <li key={i}>
                        {r.rating}/5 — {r.author}: {r.comment}
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleBookFundi} style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>Book for maintenance</h4>
                  <ErrorBox message={fundiBookError} />
                  {lastBooking ? (
                    <div className="ok" style={{ marginBottom: 8 }}>
                      Booked {lastBooking.id} — status {lastBooking.status} for{' '}
                      {lastBooking.location} at{' '}
                      {lastBooking.scheduledFor
                        ? new Date(lastBooking.scheduledFor).toLocaleString()
                        : ''}
                      <div style={{ marginTop: 8 }}>
                        <Button
                          type="button"
                          onClick={handleVerifyBooking}
                          disabled={verifyingBooking}
                        >
                          {verifyingBooking ? 'Checking...' : 'Confirm booking on QuickFundi'}
                        </Button>
                        <a
                          href={`${qf}/bookings/${lastBooking.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: 12, fontSize: 13 }}
                        >
                          open raw json on team 12
                        </a>
                      </div>
                      <ErrorBox message={verifyError} />
                      {verifiedBooking ? (
                        <p style={{ fontSize: 13, margin: '8px 0 0' }}>
                          Confirmed: {verifiedBooking.id} still {verifiedBooking.status} on
                          QuickFundi (worker {verifiedBooking.workerId}).
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <Input
                    label="Job site"
                    value={bookSite}
                    onChange={(e) => setBookSite(e.target.value)}
                    required
                  />
                  <label style={{ display: 'block', marginBottom: 12 }}>
                    When
                    <input
                      type="datetime-local"
                      value={bookWhen}
                      onChange={(e) => setBookWhen(e.target.value)}
                      required
                      style={{ display: 'block', marginTop: 4, width: '100%', maxWidth: 280 }}
                    />
                  </label>
                  <Input
                    label="Requested by"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={bookFundi.isPending}>
                    {bookFundi.isPending ? 'Sending...' : 'Create booking on QuickFundi'}
                  </Button>
                </form>
              </>
            ) : (
              <p>Profile not found.</p>
            )}
          </div>
        ) : null}
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
