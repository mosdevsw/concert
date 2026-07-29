import { useToastStore } from './toast'

describe('toast store', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
    jest.useRealTimers()
  })

  it('adds a toast with show()', () => {
    useToastStore.getState().show('hello', 'success')
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({ message: 'hello', type: 'success' })
  })

  it('defaults type to success', () => {
    useToastStore.getState().show('hi')
    expect(useToastStore.getState().toasts[0].type).toBe('success')
  })

  it('removes a toast by id', () => {
    useToastStore.getState().show('x')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().remove(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('auto-removes after 3s', () => {
    jest.useFakeTimers()
    useToastStore.getState().show('temp')
    expect(useToastStore.getState().toasts).toHaveLength(1)
    jest.advanceTimersByTime(3000)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
