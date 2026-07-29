import * as api from '@/lib/api'
import { useAuthStore } from './auth'

jest.mock('@/lib/api')

function makeToken(payload: object) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `header.${b64}.sig`
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null, hydrated: false })
    jest.clearAllMocks()
  })

  it('login stores token and decoded user', async () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.com', role: 'USER' })
    ;(api.apiFetch as jest.Mock).mockResolvedValue({ access_token: token })

    const user = await useAuthStore.getState().login('a@b.com', 'pw')

    expect(user).toEqual({ id: 'u1', email: 'a@b.com', role: 'USER' })
    expect(localStorage.getItem('token')).toBe(token)
    expect(useAuthStore.getState().user?.role).toBe('USER')
  })

  it('register stores token and returns user', async () => {
    const token = makeToken({ sub: 'u2', email: 'c@d.com', role: 'USER' })
    ;(api.apiFetch as jest.Mock).mockResolvedValue({ access_token: token })

    const user = await useAuthStore.getState().register('N', 'c@d.com', 'pw')

    expect(user.email).toBe('c@d.com')
  })

  it('logout clears token and user', () => {
    localStorage.setItem('token', 'x')
    useAuthStore.setState({
      token: 'x',
      user: { id: '1', email: 'a', role: 'USER' },
    })

    useAuthStore.getState().logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('hydrate restores user from a stored token', () => {
    const token = makeToken({ sub: 'u9', email: 'z@z.com', role: 'ADMIN' })
    localStorage.setItem('token', token)

    useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().user).toEqual({
      id: 'u9',
      email: 'z@z.com',
      role: 'ADMIN',
    })
    expect(useAuthStore.getState().hydrated).toBe(true)
  })

  it('hydrate with no token just marks hydrated', () => {
    useAuthStore.getState().hydrate()
    expect(useAuthStore.getState().hydrated).toBe(true)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('hydrate removes an invalid token', () => {
    localStorage.setItem('token', 'not-a-jwt')
    useAuthStore.getState().hydrate()
    expect(localStorage.getItem('token')).toBeNull()
    expect(useAuthStore.getState().hydrated).toBe(true)
  })
})
