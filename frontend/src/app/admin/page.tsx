'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { RouteGuard } from '@/components/RouteGuard'
import { IconHistory, IconHome, Sidebar } from '@/components/Sidebar'
import { useAdminStore } from '@/store/admin'
import { useAuthStore } from '@/store/auth'
import type { Concert } from '@/store/concert'
import { useToastStore } from '@/store/toast'
import styles from './admin.module.css'

export default function AdminPage() {
  return (
    <RouteGuard requireRole="ADMIN">
      <AdminDashboard />
    </RouteGuard>
  )
}

function AdminDashboard() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const { stats, concerts, history, fetchDashboard } = useAdminStore()

  const [section, setSection] = useState<'home' | 'history'>('home')
  const [showSwitch, setShowSwitch] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  function relogin() {
    logout()
    router.replace('/')
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        title="Admin"
        items={[
          { key: 'home', label: 'Home', icon: <IconHome /> },
          { key: 'history', label: 'History', icon: <IconHistory /> },
        ]}
        activeKey={section}
        onSelect={(k) => setSection(k as 'home' | 'history')}
        switchLabel="Switch to user"
        onSwitch={() => setShowSwitch(true)}
        onLogout={relogin}
      />

      <main className={styles.main}>
        {section === 'home' ? (
          <Home stats={stats} concerts={concerts} />
        ) : (
          <History history={history} />
        )}
      </main>

      {showSwitch && (
        <ConfirmModal
          tone="neutral"
          title="Switch to User"
          message="You need to log in again to access the User workspace. Continue?"
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={relogin}
          onCancel={() => setShowSwitch(false)}
        />
      )}
    </div>
  )
}

function Home({
  stats,
  concerts,
}: {
  stats: ReturnType<typeof useAdminStore.getState>['stats']
  concerts: Concert[]
}) {
  const [tab, setTab] = useState<'overview' | 'create'>('overview')

  return (
    <>
      <div className={styles.stats}>
        <StatCard label="Total of seats" value={stats?.totalSeats ?? 0} tone={styles.statBlue} />
        <StatCard label="Reserve" value={stats?.reserveCount ?? 0} tone={styles.statGreen} />
        <StatCard label="Cancel" value={stats?.cancelCount ?? 0} tone={styles.statRed} />
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setTab('overview')}
          className={`${styles.tab} ${tab === 'overview' ? styles.tabActive : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('create')}
          className={`${styles.tab} ${tab === 'create' ? styles.tabActive : ''}`}
        >
          Create
        </button>
      </div>

      {tab === 'overview' ? <Overview concerts={concerts} /> : <CreateForm />}
    </>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className={`${styles.statCard} ${tone}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  )
}

function Overview({ concerts }: { concerts: Concert[] }) {
  const deleteConcert = useAdminStore((s) => s.deleteConcert)
  const show = useToastStore((s) => s.show)
  const [target, setTarget] = useState<Concert | null>(null)
  const [busy, setBusy] = useState(false)

  async function onConfirmDelete() {
    if (!target) return
    setBusy(true)
    try {
      await deleteConcert(target.id)
      show('Delete successfully', 'success')
      setTarget(null)
    } catch (err) {
      show(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (concerts.length === 0) {
    return <p className={styles.muted}>No concerts yet.</p>
  }

  return (
    <div className={styles.list}>
      {concerts.map((c) => (
        <article key={c.id} className="card">
          <h2 className={styles.cardTitle}>{c.name}</h2>
          <hr className={styles.divider} />
          <p className={styles.desc}>{c.description}</p>
          <div className={styles.row}>
            <span className={styles.seats}>
              <SeatIcon />
              {c.totalSeats}
            </span>
            <button onClick={() => setTarget(c)} className="btn btnDanger">
              Delete
            </button>
          </div>
        </article>
      ))}

      {target && (
        <ConfirmModal
          tone="danger"
          title="Are you sure to delete?"
          message={`"${target.name}"`}
          confirmLabel={busy ? 'Deleting…' : 'Yes, Delete'}
          cancelLabel="Cancel"
          onConfirm={onConfirmDelete}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  )
}

function CreateForm() {
  const createConcert = useAdminStore((s) => s.createConcert)
  const show = useToastStore((s) => s.show)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalSeats, setTotalSeats] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createConcert({ name, description, totalSeats: Number(totalSeats) })
      show('Create successfully', 'success')
      setName('')
      setDescription('')
      setTotalSeats('')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Create failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h2 className={styles.formTitle}>Create</h2>

      <div className={styles.formGrid}>
        <div className="field">
          <label className="label">Concert Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Please input concert name"
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Total of seat</label>
          <input
            type="number"
            min={1}
            max={500}
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            required
            placeholder="500"
            className="input"
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Please input description"
          className="textarea"
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={loading} className="btn btnPrimary">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function History({
  history,
}: {
  history: ReturnType<typeof useAdminStore.getState>['history']
}) {
  if (history.length === 0) {
    return <p className={styles.muted}>No activity yet.</p>
  }

  return (
    <div className={`card ${styles.tableWrap}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date time</th>
            <th>Username</th>
            <th>Concert name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
              <td>{a.user.name}</td>
              <td>{a.concert.name}</td>
              <td>{a.action === 'RESERVE' ? 'Reserve' : 'Cancel'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
