import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDepartments } from '../hooks/useDepartments'
import api from '../services/api'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorBanner } from '../components/ui/ErrorBanner'

export default function AdminPage() {
  const queryClient = useQueryClient()
  const { data: departments = [], isLoading } = useDepartments()
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
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
    <PageWrapper>
      <h1>Admin</h1>

      <form className="box" onSubmit={handleCreate}>
        <h3>Add department</h3>
        <ErrorBanner message={error} />
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
        <LoadingSpinner />
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
    </PageWrapper>
  )
}
