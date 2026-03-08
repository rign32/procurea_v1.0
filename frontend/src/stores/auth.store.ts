import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '../types/campaign.types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isImpersonated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionValidated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setImpersonated: (val: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markSessionValidated: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isImpersonated: false,
  isLoading: false,
  error: null,
  sessionValidated: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) =>
          set(
            {
              user,
              isAuthenticated: user !== null,
              error: null,
            },
            false,
            'setUser'
          ),

        updateUser: (updates) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updates } : null,
            }),
            false,
            'updateUser'
          ),

        setImpersonated: (val) =>
          set({ isImpersonated: val }, false, 'setImpersonated'),

        logout: () => {
          // Clear auth tokens from localStorage
          localStorage.removeItem('procurea_token');
          localStorage.removeItem('procurea_refresh');

          set(
            {
              user: null,
              isAuthenticated: false,
              isImpersonated: false,
              error: null,
            },
            false,
            'logout'
          );
        },

        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        markSessionValidated: () => set({ sessionValidated: true }, false, 'markSessionValidated'),
      }),
      {
        name: 'auth-storage', // LocalStorage key
        partialize: (state) => ({
          // Only persist user and isAuthenticated
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isImpersonated: state.isImpersonated,
        }),
      }
    ),
    {
      name: 'auth-store',
      enabled: import.meta.env.DEV,
    }
  )
);

export default useAuthStore;
