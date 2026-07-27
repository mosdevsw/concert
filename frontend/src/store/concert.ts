import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export type Concert = {
  id: string
  name: string
  description: string
  totalSeats: number
  availableSeats: number
  createdAt: string
}

type MyReservation = {
  id: string
  concertId: string
  status: 'RESERVED' | 'CANCELLED'
}

type ConcertState = {
  concerts: Concert[]
  reservedIds: string[]
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  reserve: (concertId: string) => Promise<void>
  cancel: (concertId: string) => Promise<void>
}

export const useConcertStore = create<ConcertState>((set, get) => ({
  concerts: [],
  reservedIds: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [concerts, myReservations] = await Promise.all([
        apiFetch<Concert[]>('/concerts'),
        apiFetch<MyReservation[]>('/reservations/me'),
      ])
      set({
        concerts,
        reservedIds: myReservations.map((r) => r.concertId),
        loading: false,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load concerts',
      })
    }
  },

  reserve: async (concertId) => {
    await apiFetch(`/reservations/${concertId}`, { method: 'POST' })
    await get().fetchAll()
  },

  cancel: async (concertId) => {
    await apiFetch(`/reservations/${concertId}`, { method: 'DELETE' })
    await get().fetchAll()
  },
}))
