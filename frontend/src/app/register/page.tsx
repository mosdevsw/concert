'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthPanel } from '@/components/AuthPanel'
import { PasswordInput } from '@/components/PasswordInput'
import { useAuthStore } from '@/store/auth'
import styles from './register.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      router.replace('/user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel>
      <form onSubmit={onSubmit} className={styles.form}>
        <h1 className={styles.title}>Sign Up</h1>

        {error && <p className="formError">{error}</p>}

        <Field label="Full name" value={name} onChange={setName} placeholder="Enter your Full Name" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="Enter your Email Address" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a Password" />
        <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter your Password" />

        <button
          type="submit"
          disabled={loading}
          className={`btn btnPrimary ${styles.submit}`}
        >
          {loading ? 'Creating…' : 'Create an account'}
        </button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </AuthPanel>
  )
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {type === 'password' ? (
        <PasswordInput
          id={id}
          value={value}
          onChange={onChange}
          required
          minLength={6}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className="input"
        />
      )}
    </div>
  )
}
