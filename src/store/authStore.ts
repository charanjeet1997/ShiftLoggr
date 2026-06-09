import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, LoginPayload } from '../types'
import * as authApi from '../api/auth'
import type { RegisterPayload } from '../api/auth'
import { errorMessage, setSession } from '../api/client'
import { identify, track } from '../firebase'

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading'
  error: string | null
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',
      error: null,

      login: async (payload) => {
        set({ status: 'loading', error: null })
        try {
          const user = await authApi.login(payload)
          setSession(user)
          set({ user, status: 'idle' })
          identify(user)
          track('login', { method: 'password', role: user.role })
          return user
        } catch (err) {
          set({ status: 'idle', error: errorMessage(err) })
          throw err
        }
      },

      register: async (payload) => {
        set({ status: 'loading', error: null })
        try {
          const user = await authApi.register(payload)
          setSession(user)
          set({ user, status: 'idle' })
          identify(user)
          track('sign_up', { method: 'password', role: user.role })
          return user
        } catch (err) {
          set({ status: 'idle', error: errorMessage(err) })
          throw err
        }
      },

      logout: () => {
        setSession(null)
        set({ user: null, error: null })
        track('logout')
        identify(null)
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'shiftloggr.auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
