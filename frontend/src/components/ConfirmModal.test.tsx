import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from './ConfirmModal'

describe('ConfirmModal', () => {
  it('renders title and message and fires callbacks', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()

    render(
      <ConfirmModal
        title="Sure?"
        message="details here"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByText('Sure?')).toBeInTheDocument()
    expect(screen.getByText('details here')).toBeInTheDocument()

    await userEvent.click(screen.getByText('No'))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByText('Yes'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders neutral tone with default labels', () => {
    render(
      <ConfirmModal
        title="Switch?"
        tone="neutral"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('Switch?')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
