'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { RouteGuard } from '@/components/RouteGuard'
import { useConcertStore } from '@/store/concert'

export default function HomePage() {
  return (
    <RouteGuard>
      <Header view="user" />
      <ConcertList />
    </RouteGuard>
  )
}

function ConcertList() {
  const { concerts, reservedIds, loading, error, fetchAll, reserve, cancel } =
    useConcertStore()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function onAction(id: string, reserved: boolean) {
    setBusyId(id)
    setActionError('')
    try {
      await (reserved ? cancel(id) : reserve(id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {actionError}
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {loading && concerts.length === 0 && (
        <p className="text-gray-500">Loading…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {concerts.map((c) => {
          const reserved = reservedIds.includes(c.id)
          const soldOut = c.availableSeats <= 0 && !reserved
          return (
            <article
              key={c.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">{c.name}</h2>
              <p className="mt-1 flex-1 text-sm text-gray-600">
                {c.description}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Seats: {c.availableSeats} / {c.totalSeats}
              </p>

              <button
                disabled={soldOut || busyId === c.id}
                onClick={() => onAction(c.id, reserved)}
                className={`mt-4 rounded-lg py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                  reserved
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {soldOut
                  ? 'Sold out'
                  : busyId === c.id
                    ? 'Please wait…'
                    : reserved
                      ? 'Cancel'
                      : 'Reserve'}
              </button>
            </article>
          )
        })}
      </div>

      {!loading && concerts.length === 0 && !error && (
        <p className="text-gray-500">No concerts available yet.</p>
      )}
    </main>
  )
}
