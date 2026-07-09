import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore.js';
import authService from '../services/auth.service.js';

export function useAuth() {
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthed = useAuthStore((state) => state.isAuthed);
  const loginAction = useAuthStore((state) => state.login);
  const logoutAction = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data && meQuery.data.user) {
      setUser(meQuery.data.user);
    }
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.isError) {
      logoutAction();
    }
  }, [meQuery.isError, logoutAction]);

  async function login(email, password) {
    const data = await authService.login(email, password);
    loginAction(data.user, data.token);
    queryClient.setQueryData(['auth', 'me'], { user: data.user });
    return data;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed, clearing local auth anyway');
    }
    logoutAction();
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  }

  return {
    user,
    token,
    isAuthed,
    isLoadingUser: meQuery.isLoading && !!token,
    login,
    logout,
  };
}

export default useAuth;
