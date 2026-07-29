import { create } from 'zustand'

export type ToastType = 'success' | 'error'

export type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastState = {
  toasts: Toast[]
  show: (message: string, type?: ToastType) => void
  remove: (id: number) => void
}

let counter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'success') => {
    const id = ++counter
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
