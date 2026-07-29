'use client'

import styles from './Sidebar.module.css'

type NavItem = {
  key: string
  label: string
  icon: React.ReactNode
}

export function Sidebar({
  title,
  items,
  activeKey,
  onSelect,
  switchLabel,
  onSwitch,
  onLogout,
}: {
  title: string
  items: NavItem[]
  activeKey: string
  onSelect: (key: string) => void
  switchLabel: string
  onSwitch: () => void
  onLogout: () => void
}) {
  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>{title}</h1>

      <nav className={styles.nav}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeKey === item.key
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button
          onClick={onSwitch}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <IconSwitch />
          {switchLabel}
        </button>
      </nav>

      <button
        onClick={onLogout}
        className={`${styles.logout} flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50`}
      >
        <IconLogout />
        Logout
      </button>
    </aside>
  )
}

export function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

export function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </svg>
  )
}

function IconSwitch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}
