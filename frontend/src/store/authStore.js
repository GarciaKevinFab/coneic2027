import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      updateProfile: (profileData) => {
        const currentUser = get().user;
        set({ user: { ...currentUser, ...profileData } });
      },

      isOrganizer: () => {
        const user = get().user;
        return user?.is_staff === true || user?.role === 'organizer' || user?.role === 'admin';
      },

      hasTicket: () => {
        const user = get().user;
        return !!user?.ticket_id;
      },
    }),
    {
      name: 'coneic-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
