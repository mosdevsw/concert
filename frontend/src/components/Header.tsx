'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export function Header({ view }: { view: 'user' | 'admin' }) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [showDenied, setShowDenied] = useState(false)

  function onSwitch() {
    if (view === 'admin') {
      router.push('/')
      return
    }
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else {
      setShowDenied(true)
    }
  }

  function confirmRelogin() {
    logout()
    router.replace('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <span className="text-lg font-semibold text-gray-900">
        Concert Booking
      </span>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-500 sm:inline">
          {user?.email}
        </span>

        <button
          onClick={onSwitch}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {view === 'admin' ? 'Switch to User' : 'Switch to Admin'}
        </button>

        <button
          onClick={() => {
            logout()
            router.replace('/login')
          }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          Logout
        </button>
      </div>

      {showDenied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              No admin access
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              คุณไม่มีสิทธิ์เข้าใช้งาน Admin กรุณากลับไป login ใหม่
              ต้องการยืนยันหรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDenied(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                No
              </button>
              <button
                onClick={confirmRelogin}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
