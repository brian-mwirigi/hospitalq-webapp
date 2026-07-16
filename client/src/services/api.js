import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('hq_token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

api.interceptors.response.use(
  function (res) {
    return res
  },
  function (err) {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('hq_token')
    }
    return Promise.reject(err)
  }
)

export default api
