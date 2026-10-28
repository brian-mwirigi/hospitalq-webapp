import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

api.interceptors.request.use(function (config) {
  const apiKey = import.meta.env.VITE_API_KEY
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
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
      const code = err.response.data && err.response.data.error
      if (code === 'NO_TOKEN' || code === 'INVALID_TOKEN' || code === 'INVALID_USER') {
        localStorage.removeItem('hq_token')
      }
    }
    return Promise.reject(err)
  }
)

export default api
