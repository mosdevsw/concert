'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore, type Role } from '@/store/auth'

export function RouteGuard({
  children,
  requireRole,
}: {
  children: React.ReactNode
  requireRole?: Role
}) {
  const router = useRouter()
  const { user, hydrated } = useAuthStore()

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace('/')
    } else if (requireRole && user.role !== requireRole) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/user')
    }
  }, [hydrated, user, requireRole, router])

  if (!hydrated || !user || (requireRole && user.role !== requireRole)) {
    return null
  }

  return <>{children}</>
}
