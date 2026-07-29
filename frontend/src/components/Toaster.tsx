'use client'

import { useToastStore } from '@/store/toast'
import styles from './Toaster.module.css'

export function Toaster() {
  const { toasts, remove } = useToastStore()

  return (
    <div className={styles.wrap}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${t.type === 'success' ? styles.success : styles.error}`}
        >
          <span
            className={`${styles.icon} ${t.type === 'success' ? styles.iconSuccess : styles.iconError}`}
          >
            {t.type === 'success' ? '✓' : '!'}
          </span>
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className={styles.close}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
