import styles from './AuthPanel.module.css'

export function AuthPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.brandRow}>
          <span className={styles.logoDot} />
          <span className={styles.brand}>BRAND</span>
        </div>
        <div className={styles.bottomPannel}>
          <p className={styles.quote}>
            &ldquo;Powering the tools that power the team.&rdquo;
          </p>
          <p className={styles.quoteSub}>
            Reserve your seat for free concerts. Manage listings, track
            reservations, and keep everything in one place.
          </p>
        </div>
      </div>

      <div className={styles.formArea}>{children}</div>
    </div>
  )
}
