import * as api from '@/lib/api'
import { useAdminStore } from './admin'
import { useToastStore } from './toast'

jest.mock('@/lib/api')

describe('admin store', () => {
  beforeEach(() => {
    useAdminStore.setState({
      stats: null,
      concerts: [],
      history: [],
      loading: false,
      error: null,
    })
    useToastStore.setState({ toasts: [] })
    jest.clearAllMocks()
  })

  it('fetchDashboard loads stats, concerts and history', async () => {
    ;(api.apiFetch as jest.Mock)
      .mockResolvedValueOnce({ totalSeats: 100, reserveCount: 2, cancelCount: 1 })
      .mockResolvedValueOnce([{ id: 'c1' }])
      .mockResolvedValueOnce([{ id: 'a1' }])

    await useAdminStore.getState().fetchDashboard()

    const s = useAdminStore.getState()
    expect(s.stats?.totalSeats).toBe(100)
    expect(s.concerts).toHaveLength(1)
    expect(s.history).toHaveLength(1)
  })

  it('fetchDashboard error shows an error toast', async () => {
    ;(api.apiFetch as jest.Mock).mockRejectedValue(new Error('down'))
    await useAdminStore.getState().fetchDashboard()
    expect(useToastStore.getState().toasts[0].type).toBe('error')
  })

  it('createConcert posts the payload then refetches', async () => {
    const spy = api.apiFetch as jest.Mock
    spy.mockResolvedValue([])
    await useAdminStore.getState().createConcert({
      name: 'A',
      description: 'd',
      totalSeats: 5,
    })
    expect(spy).toHaveBeenCalledWith('/concerts', {
      method: 'POST',
      body: JSON.stringify({ name: 'A', description: 'd', totalSeats: 5 }),
    })
  })

  it('deleteConcert deletes then refetches', async () => {
    const spy = api.apiFetch as jest.Mock
    spy.mockResolvedValue([])
    await useAdminStore.getState().deleteConcert('c9')
    expect(spy).toHaveBeenCalledWith('/concerts/c9', { method: 'DELETE' })
  })
})
