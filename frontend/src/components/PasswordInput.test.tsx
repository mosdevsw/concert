import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { PasswordInput } from './PasswordInput'

function Wrapper() {
  const [v, setV] = useState('')
  return <PasswordInput id="pw" value={v} onChange={setV} placeholder="pw" />
}

describe('PasswordInput', () => {
  it('starts hidden and toggles between password and text', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('pw') as HTMLInputElement

    expect(input.type).toBe('password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input.type).toBe('text')
    await userEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input.type).toBe('password')
  })

  it('reflects typed value', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('pw') as HTMLInputElement
    await userEvent.type(input, 'secret')
    expect(input.value).toBe('secret')
  })
})
