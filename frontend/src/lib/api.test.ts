import { apiFetch, getToken } from './api'

function mockFetch(res: Partial<Response> & { json?: () => Promise<unknown> }) {
  global.fetch = jest.fn().mockResolvedValue(res) as unknown as typeof fetch
  return global.fetch as jest.Mock
}

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('returns parsed json on success', async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ a: 1 }) })
    await expect(apiFetch('/x')).resolves.toEqual({ a: 1 })
  })

  it('attaches Bearer token when present', async () => {
    localStorage.setItem('token', 'tok123')
    const fetchMock = mockFetch({ ok: true, status: 200, json: async () => ({}) })
    await apiFetch('/x')
    const headers = fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Bearer tok123')
  })

  it('throws a friendly message on network failure', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch
    await expect(apiFetch('/x')).rejects.toThrow(/Unable to reach the server/)
  })

  it('joins array validation messages', async () => {
    mockFetch({ ok: false, status: 400, json: async () => ({ message: ['a', 'b'] }) })
    await expect(apiFetch('/x')).rejects.toThrow('a, b')
  })

  it('maps 401 on a non-auth route to session expired', async () => {
    mockFetch({ ok: false, status: 401, json: async () => ({ message: 'Unauthorized' }) })
    await expect(apiFetch('/concerts')).rejects.toThrow(/session has expired/)
  })

  it('uses the server message on other errors', async () => {
    mockFetch({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Email already in use' }),
    })
    await expect(apiFetch('/auth/register')).rejects.toThrow('Email already in use')
  })

  it('falls back to a generic message when body has none', async () => {
    mockFetch({ ok: false, status: 500, json: async () => ({}) })
    await expect(apiFetch('/x')).rejects.toThrow(/Something went wrong/)
  })

  it('getToken returns null when no token stored', () => {
    localStorage.removeItem('token')
    expect(getToken()).toBeNull()
  })
})
