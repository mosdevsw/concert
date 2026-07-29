import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import type { Concert } from '@/store/concert'
import { useToastStore } from '@/store/toast'

export type Stats = {
  totalSeats: number
  reserveCount: number
  cancelCount: number
}

export type Activity = {
  id: string
  action: 'RESERVE' | 'CANCEL'
  createdAt: string
  user: { id: string; name: string; email: string }
  concert: { id: string; name: string }
}

type CreateConcertInput = {
  name: string
  description: string
  totalSeats: number
}

type AdminState = {
  stats: Stats | null
  concerts: Concert[]
  history: Activity[]
  loading: boolean
  error: string | null
  fetchDashboard: () => Promise<void>
  createConcert: (input: CreateConcertInput) => Promise<void>
  deleteConcert: (id: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  concerts: [],
  history: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const [stats, concerts, history] = await Promise.all([
        apiFetch<Stats>('/concerts/stats'),
        apiFetch<Concert[]>('/concerts'),
        apiFetch<Activity[]>('/reservations/history'),
      ])
      set({ stats, concerts, history, loading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard.'
      useToastStore.getState().show(message, 'error')
      set({ loading: false, error: message })
    }
  },

  createConcert: async (input) => {
    await apiFetch('/concerts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    await get().fetchDashboard()
  },

  deleteConcert: async (id) => {
    await apiFetch(`/concerts/${id}`, { method: 'DELETE' })
    await get().fetchDashboard()
  },
}))
