'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { AuthPanel } from '@/components/AuthPanel'
import { PasswordInput } from '@/components/PasswordInput'
import { useAuthStore } from '@/store/auth'
import styles from './login.module.css'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const asAdmin = params.get('as') === 'admin'

  const { login, logout } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const expectedRole = asAdmin ? 'ADMIN' : 'USER'
      const user = await login(email, password)
      if (user.role !== expectedRole) {
        logout()
        setError(
          asAdmin
            ? 'You do not have permission to access the Admin portal.'
            : 'This is an administrator account. Please use the Administrator entry.',
        )
        return
      }
      router.replace(expectedRole === 'ADMIN' ? '/admin' : '/user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.title}>
        <span>Login</span>
      </div>

      {error && <p className="formError">{error}</p>}

      <div className="field">
        <label className="label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your Email Address"
          className="input"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          required
          placeholder="Enter your Password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn btnPrimary ${styles.submit}`}
      >
        {loading ? 'Signing in…' : asAdmin ? 'Login as Administrator' : 'Login'}
      </button>

      {!asAdmin && (
        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.link}>
            Create an account
          </Link>
        </p>
      )}
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthPanel>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthPanel>
  )
}
