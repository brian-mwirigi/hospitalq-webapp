import { create } from 'zustand';

const savedToken = localStorage.getItem('hq_token');

const useAuthStore = create((set) => ({
  user: null,
  token: savedToken || null,
  isAuthed: false,

  login: (userData, token) => {
    localStorage.setItem('hq_token', token);
    set({
      user: userData,
      token: token,
      isAuthed: !!(token && userData),
    });
  },

  logout: () => {
    localStorage.removeItem('hq_token');
    set({
      user: null,
      token: null,
      isAuthed: false,
    });
  },

  setUser: (user) => {
    set((state) => ({
      user: user,
      isAuthed: !!(state.token && user),
    }));
  },
}));

export default useAuthStore;
