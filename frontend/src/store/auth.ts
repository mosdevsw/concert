import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export type Role = 'USER' | 'ADMIN'

export type AuthUser = {
  id: string
  email: string
  role: Role
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  hydrated: boolean
  hydrate: () => void
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

function decodeToken(token: string): AuthUser {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return { id: payload.sub, email: payload.email, role: payload.role }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: () => {
    const token = getStoredToken()
    if (token) {
      try {
        set({ token, user: decodeToken(token), hydrated: true })
        return
      } catch {
        localStorage.removeItem('token')
      }
    }
    set({ hydrated: true })
  },

  login: async (email, password) => {
    const { access_token } = await apiFetch<{ access_token: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    )
    localStorage.setItem('token', access_token)
    const user = decodeToken(access_token)
    set({ token: access_token, user })
    return user
  },

  register: async (name, email, password) => {
    const { access_token } = await apiFetch<{ access_token: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) },
    )
    localStorage.setItem('token', access_token)
    const user = decodeToken(access_token)
    set({ token: access_token, user })
    return user
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },
}))

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}
