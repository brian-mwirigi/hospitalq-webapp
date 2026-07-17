import api from './api.js';

export async function getAll() {
  const response = await api.get('/departments');
  return response.data.data;
}

export async function getBySlug(slug) {
  const response = await api.get(`/departments/${slug}`);
  return response.data.data;
}

const deptApi = {
  getAll,
  getBySlug,
};

export default deptApi;
