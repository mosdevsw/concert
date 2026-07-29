'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { RouteGuard } from '@/components/RouteGuard'
import { IconHome, Sidebar } from '@/components/Sidebar'
import { useAuthStore } from '@/store/auth'
import { useConcertStore } from '@/store/concert'
import { useToastStore } from '@/store/toast'
import styles from './user.module.css'

export default function UserPage() {
  return (
    <RouteGuard requireRole="USER">
      <UserDashboard />
    </RouteGuard>
  )
}

function UserDashboard() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [showSwitch, setShowSwitch] = useState(false)

  function relogin() {
    logout()
    router.replace('/')
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        title="User"
        items={[{ key: 'home', label: 'Home', icon: <IconHome /> }]}
        activeKey="home"
        onSelect={() => {}}
        switchLabel="Switch to Admin"
        onSwitch={() => setShowSwitch(true)}
        onLogout={relogin}
      />
      <ConcertList />

      {showSwitch && (
        <ConfirmModal
          tone="neutral"
          title="Switch to Admin"
          message="You need to log in again to access the Admin portal. Continue?"
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={relogin}
          onCancel={() => setShowSwitch(false)}
        />
      )}
    </div>
  )
}

function ConcertList() {
  const { concerts, reservedIds, loading, error, fetchAll, reserve, cancel } =
    useConcertStore()
  const show = useToastStore((s) => s.show)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function onAction(id: string, reserved: boolean) {
    setBusyId(id)
    try {
      if (reserved) {
        await cancel(id)
        show('Canceled reservation', 'success')
      } else {
        await reserve(id)
        show('Reserved successfully', 'success')
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className={styles.main}>
      {loading && concerts.length === 0 && <p className={styles.muted}>Loading…</p>}

      <div className={styles.list}>
        {concerts.map((c) => {
          const reserved = reservedIds.includes(c.id)
          const soldOut = c.availableSeats <= 0 && !reserved
          return (
            <article key={c.id} className="card">
              <h2 className={styles.cardTitle}>{c.name}</h2>
              <hr className={styles.divider} />
              <p className={styles.desc}>{c.description}</p>
              <div className={styles.row}>
                <span className={styles.seats}>
                  <SeatIcon />
                  {c.availableSeats}
                </span>

                {reserved ? (
                  <button
                    disabled={busyId === c.id}
                    onClick={() => onAction(c.id, true)}
                    className={`btn btnDanger ${styles.action}`}
                  >
                    {busyId === c.id ? '…' : 'Cancel'}
                  </button>
                ) : (
                  <button
                    disabled={soldOut || busyId === c.id}
                    onClick={() => onAction(c.id, false)}
                    className={`btn btnPrimary ${styles.action}`}
                  >
                    {soldOut ? 'Sold out' : busyId === c.id ? '…' : 'Reserve'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {!loading && concerts.length === 0 && !error && (
        <p className={styles.muted}>No concerts available yet.</p>
      )}
      {!loading && error && (
        <p className={styles.muted}>Couldn&apos;t load concerts. Please try again.</p>
      )}
    </main>
  )
}

function SeatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}
