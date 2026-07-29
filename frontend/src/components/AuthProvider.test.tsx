import { render, screen } from '@testing-library/react'
import { useAuthStore } from '@/store/auth'
import { AuthProvider } from './AuthProvider'

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null, hydrated: false })
  })

  it('hydrates the auth store on mount and renders children', () => {
    render(
      <AuthProvider>
        <div>app</div>
      </AuthProvider>,
    )
    expect(useAuthStore.getState().hydrated).toBe(true)
    expect(screen.getByText('app')).toBeInTheDocument()
  })
})
