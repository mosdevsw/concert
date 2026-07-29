import { render, screen } from '@testing-library/react'
import { useAuthStore } from '@/store/auth'
import { RouteGuard } from './RouteGuard'

const replace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('RouteGuard', () => {
  beforeEach(() => {
    replace.mockClear()
    useAuthStore.setState({ token: null, user: null, hydrated: false })
  })

  it('renders nothing until hydrated', () => {
    const { container } = render(
      <RouteGuard>
        <div>child</div>
      </RouteGuard>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to / when hydrated with no user', () => {
    useAuthStore.setState({ hydrated: true, user: null })
    render(
      <RouteGuard>
        <div>child</div>
      </RouteGuard>,
    )
    expect(replace).toHaveBeenCalledWith('/')
  })

  it('renders children when the role matches', () => {
    useAuthStore.setState({
      hydrated: true,
      user: { id: '1', email: 'a', role: 'ADMIN' },
    })
    render(
      <RouteGuard requireRole="ADMIN">
        <div>secret</div>
      </RouteGuard>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('redirects to own dashboard when the role mismatches', () => {
    useAuthStore.setState({
      hydrated: true,
      user: { id: '1', email: 'a', role: 'USER' },
    })
    render(
      <RouteGuard requireRole="ADMIN">
        <div>secret</div>
      </RouteGuard>,
    )
    expect(replace).toHaveBeenCalledWith('/user')
  })
})
