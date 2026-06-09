import { useAuthStore } from '../store/authStore'

// Thin selector hook so components don't reach into the store shape directly.
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const clearError = useAuthStore((s) => s.clearError)

  return {
    user,
    status,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  }
}
