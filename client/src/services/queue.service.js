import api from './api.js';

export async function getQueue(deptId) {
  const response = await api.get(`/queue/${deptId}`);
  return response.data.data;
}

export async function addPatient(patientData) {
  const response = await api.post('/queue', patientData);
  return response.data.data;
}

export async function markDone(entryId) {
  const response = await api.patch(`/queue/${entryId}/done`);
  return response.data.data;
}

export async function markNoShow(entryId) {
  const response = await api.patch(`/queue/${entryId}/no-show`);
  return response.data.data;
}

export async function markInProgress(entryId) {
  const response = await api.patch(`/queue/${entryId}/in-progress`);
  return response.data.data;
}

export async function skipPatient(entryId) {
  const response = await api.patch(`/queue/${entryId}/skip`);
  return response.data.data;
}

export async function removePatient(entryId) {
  const response = await api.delete(`/queue/${entryId}`);
  return response.data.data;
}

export async function getStats(deptId) {
  const response = await api.get(`/queue/${deptId}/stats`);
  return response.data.data;
}

const queueService = {
  getQueue,
  addPatient,
  markDone,
  markNoShow,
  markInProgress,
  skipPatient,
  removePatient,
  getStats,
};

export default queueService;
