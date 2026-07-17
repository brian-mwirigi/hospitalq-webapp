import { create } from 'zustand'

let savedToken = localStorage.getItem('hq_token')

const useAuthStore = create((set) => ({
  user: null,
  token: savedToken ? savedToken : null,
  isAuthed: false,

  login: function (userData, token) {
    localStorage.setItem('hq_token', token)
    set({
      user: userData,
      token: token,
      isAuthed: true,
    })
  },

  logout: function () {
    localStorage.removeItem('hq_token')
    set({
      user: null,
      token: null,
      isAuthed: false,
    })
  },

  setUser: function (user) {
    set(function (state) {
      return {
        user: user,
        isAuthed: state.token && user ? true : false,
      }
    })
  },
}))

export default useAuthStore
