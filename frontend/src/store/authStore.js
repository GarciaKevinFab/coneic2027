import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hydration tracking - external to avoid persist issues
let _hydrated = false;
const _hydratedCallbacks = new Set();

const originalRehydrate = useAuthStore.persist.onFinishHydration;
useAuthStore.persist.onFinishHydration(() => {
  _hydrated = true;
  _hydratedCallbacks.forEach((cb) => cb());
  _hydratedCallbacks.clear();
});

// Also check if already hydrated synchronously
if (useAuthStore.persist.hasHydrated()) {
  _hydrated = true;
}

export const getHasHydrated = () => _hydrated;
export const onHydrate = (cb) => {
  if (_hydrated) {
    cb();
  } else {
    _hydratedCallbacks.add(cb);
  }
};

export default useAuthStore;
