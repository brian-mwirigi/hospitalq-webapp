import api from './api.js'

export async function searchWorkers(jobType, location) {
  const res = await api.get('/quickfundi/workers', {
    params: { jobType, location },
  })
  return res.data.data
}

export async function getWorker(id) {
  const res = await api.get('/quickfundi/workers/' + id)
  return res.data.data
}

export async function createBooking(body) {
  const res = await api.post('/quickfundi/bookings', body)
  return res.data
}

export async function getBooking(id) {
  const res = await api.get('/quickfundi/bookings/' + id)
  return res.data.data
}
