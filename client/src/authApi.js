import api from './api.js'

export async function login(email, password) {
  const res = await api.post('/auth/login', {
    email: email,
    password: password,
  })
  return res.data.data
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data.data
}

export async function logout() {
  const res = await api.post('/auth/logout')
  return res.data
}

const authApi = {
  login: login,
  getMe: getMe,
  logout: logout,
}

export default authApi
