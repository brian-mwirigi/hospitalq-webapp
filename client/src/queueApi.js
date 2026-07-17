import api from './api.js'

export async function getQueue(deptId) {
  const res = await api.get('/queue/' + deptId)
  return res.data.data
}

export async function addPatient(data) {
  const res = await api.post('/queue', data)
  return res.data.data
}

export async function markDone(id) {
  const res = await api.patch('/queue/' + id + '/done')
  return res.data.data
}

export async function markNoShow(id) {
  const res = await api.patch('/queue/' + id + '/no-show')
  return res.data.data
}

export async function markInProgress(id) {
  const res = await api.patch('/queue/' + id + '/in-progress')
  return res.data.data
}

export async function skipPatient(id) {
  const res = await api.patch('/queue/' + id + '/skip')
  return res.data.data
}

export async function removePatient(id) {
  const res = await api.delete('/queue/' + id)
  return res.data.data
}

export async function getStats(deptId) {
  const res = await api.get('/queue/' + deptId + '/stats')
  return res.data.data
}

const queueApi = {
  getQueue,
  addPatient,
  markDone,
  markNoShow,
  markInProgress,
  skipPatient,
  removePatient,
  getStats,
}

export default queueApi
