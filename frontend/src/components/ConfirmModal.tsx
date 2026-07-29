'use client'

import styles from './ConfirmModal.module.css'

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  onCancel: () => void
}) {
  const danger = tone === 'danger'
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div
          className={`${styles.badge} ${danger ? styles.badgeDanger : styles.badgeNeutral}`}
        >
          {danger ? '✕' : '?'}
        </div>
        <h2 className={styles.title}>{title}</h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancel}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.confirm} ${danger ? styles.confirmDanger : styles.confirmNeutral}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
