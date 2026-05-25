import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/signin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        set({ isLoading: false, error: data.error || 'Login gagal. Periksa email dan password.' })
        return false
      }

      await get().fetchUser()
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: data.error || 'Registrasi gagal' })
        return false
      }

      set({ isLoading: false })
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {
      // Continue logout even if API call fails
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      const data = await res.json()
      if (data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: 'Gagal mengambil data user' })
    }
  },
}))
