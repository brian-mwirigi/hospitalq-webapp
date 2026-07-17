import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useAuthStore from './authStore.js'
import authApi from './authApi.js'

export function useAuth() {
  const queryClient = useQueryClient()

  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const loginAction = useAuthStore((s) => s.login)
  const logoutAction = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)

  let shouldFetchMe = false
  if (token && !user) {
    shouldFetchMe = true
  }

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: shouldFetchMe,
    retry: false,
  })

  useEffect(() => {
    if (meQuery.data && meQuery.data.user) {
      setUser(meQuery.data.user)
    }
  }, [meQuery.data])

  useEffect(() => {
    if (meQuery.isError && meQuery.error && meQuery.error.response) {
      if (meQuery.error.response.status === 401) {
        logoutAction()
      }
    }
  }, [meQuery.isError])

  async function login(email, password) {
    const data = await authApi.login(email, password)
    loginAction(data.user, data.token)
    queryClient.setQueryData(['auth', 'me'], { user: data.user })
    return data
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {}
    logoutAction()
    queryClient.removeQueries({ queryKey: ['auth', 'me'] })
  }

  let loadingUser = false
  if (token && !user && meQuery.isLoading) {
    loadingUser = true
  }

  return {
    user: user,
    token: token,
    isAuthed: isAuthed,
    isLoadingUser: loadingUser,
    login: login,
    logout: logout,
  }
}

export default useAuth
