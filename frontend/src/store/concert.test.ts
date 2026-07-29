import * as api from '@/lib/api'
import { useConcertStore } from './concert'
import { useToastStore } from './toast'

jest.mock('@/lib/api')

describe('concert store', () => {
  beforeEach(() => {
    useConcertStore.setState({
      concerts: [],
      reservedIds: [],
      loading: false,
      error: null,
    })
    useToastStore.setState({ toasts: [] })
    jest.clearAllMocks()
  })

  it('fetchAll loads concerts and reserved ids', async () => {
    ;(api.apiFetch as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: 'c1',
          name: 'A',
          description: 'd',
          totalSeats: 10,
          availableSeats: 5,
          createdAt: '',
        },
      ])
      .mockResolvedValueOnce([{ id: 'r1', concertId: 'c1', status: 'RESERVED' }])

    await useConcertStore.getState().fetchAll()

    const s = useConcertStore.getState()
    expect(s.concerts).toHaveLength(1)
    expect(s.reservedIds).toEqual(['c1'])
    expect(s.loading).toBe(false)
  })

  it('fetchAll on error sets error and shows a toast', async () => {
    ;(api.apiFetch as jest.Mock).mockRejectedValue(new Error('boom'))

    await useConcertStore.getState().fetchAll()

    expect(useConcertStore.getState().error).toBe('boom')
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      message: 'boom',
      type: 'error',
    })
  })

  it('reserve posts then refetches', async () => {
    const spy = api.apiFetch as jest.Mock
    spy.mockResolvedValue([])
    await useConcertStore.getState().reserve('c1')
    expect(spy).toHaveBeenCalledWith('/reservations/c1', { method: 'POST' })
  })

  it('cancel deletes then refetches', async () => {
    const spy = api.apiFetch as jest.Mock
    spy.mockResolvedValue([])
    await useConcertStore.getState().cancel('c1')
    expect(spy).toHaveBeenCalledWith('/reservations/c1', { method: 'DELETE' })
  })
})
