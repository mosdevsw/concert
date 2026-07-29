import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useToastStore } from '@/store/toast'
import { Toaster } from './Toaster'

describe('Toaster', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('renders a success toast from the store', () => {
    useToastStore.setState({
      toasts: [{ id: 1, message: 'saved ok', type: 'success' }],
    })
    render(<Toaster />)
    expect(screen.getByText('saved ok')).toBeInTheDocument()
  })

  it('renders an error toast', () => {
    useToastStore.setState({
      toasts: [{ id: 2, message: 'went wrong', type: 'error' }],
    })
    render(<Toaster />)
    expect(screen.getByText('went wrong')).toBeInTheDocument()
  })

  it('removes a toast when the close button is clicked', async () => {
    useToastStore.setState({
      toasts: [{ id: 3, message: 'dismiss me', type: 'success' }],
    })
    render(<Toaster />)
    await userEvent.click(screen.getByText('✕'))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<Toaster />)
    expect(container.querySelectorAll('span')).toHaveLength(0)
  })
})
