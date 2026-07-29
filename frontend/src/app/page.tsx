'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function SelectAccessPage() {
  const router = useRouter()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logoDot} />
        <span className={styles.brand}>BRAND</span>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Select Access Level</h1>
        <p className={styles.subtitle}>
          Lorem ipsum dolor sit amet consectetur. Elit purus nam.
        </p>

        <div className={styles.cards}>
          <AccessCard
            variant="user"
            title="User"
            description="Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non"
            cta="Enter Workspace"
            iconSrc="/user-landing-icon.svg"
            iconBtn="/user-arrow-forward.svg"
            onClick={() => router.push('/login?as=user')}
          />
          <AccessCard
            variant="admin"
            title="Administrator"
            description="Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non"
            cta="Enter Portal"
            iconSrc="/admin-landing-icon.svg"
            iconBtn="/admin-arrow-forward.svg"
            onClick={() => router.push('/login?as=admin')}
          />
        </div>
      </main>
    </div>
  )
}

function AccessCard({
  variant,
  title,
  description,
  cta,
  iconSrc,
  iconBtn,
  onClick,
}: {
  variant: 'user' | 'admin'
  title: string
  description: string
  cta: string
  iconSrc?: string
  iconBtn?: string
  onClick: () => void
}) {
  const isAdmin = variant === 'admin'
  return (
    <div
      className={`${styles.card} ${isAdmin ? styles.cardAdmin : styles.cardUser}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.icon}>
          {iconSrc ? (
            <Image src={iconSrc} alt={title} width={90} height={90} />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          )}
        </div>

        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDesc}>{description}</p>
      </div>

      <button
        onClick={onClick}
        className={`${styles.cta} ${isAdmin ? styles.ctaAdmin : styles.ctaUser}`}
      >
        {cta}
        {iconBtn ? (
            <Image src={iconBtn} alt={title} width={24} height={24} />
          ) : (
            ' ->'
          )}
      </button>
    </div>
  )
}
