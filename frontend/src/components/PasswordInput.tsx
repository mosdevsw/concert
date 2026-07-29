'use client'

import { useState } from 'react'
import styles from './PasswordInput.module.css'

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
}) {
  const [show, setShow] = useState(false)

  return (
    <div className={styles.wrap}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="input"
        style={{ paddingRight: '2.75rem' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className={styles.toggle}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.6 6.6C3.9 8.2 2 12 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.1-.8" />
    </svg>
  )
}
