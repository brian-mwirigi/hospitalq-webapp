import api from './api.js';

export async function getOverview() {
  const response = await api.get('/analytics/overview');
  return response.data.data;
}

export async function getRedirectSuggestion(deptId) {
  const response = await api.get(`/analytics/redirect/${deptId}`);
  return response.data.data;
}

export async function getSmsLogs() {
  const response = await api.get('/analytics/sms');
  return response.data.data;
}

const analyticsApi = {
  getOverview,
  getRedirectSuggestion,
  getSmsLogs,
};

export default analyticsApi;
