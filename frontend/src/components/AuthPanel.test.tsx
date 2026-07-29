import { render, screen } from '@testing-library/react'
import { AuthPanel } from './AuthPanel'

describe('AuthPanel', () => {
  it('renders the brand and its children', () => {
    render(
      <AuthPanel>
        <div>form-here</div>
      </AuthPanel>,
    )
    expect(screen.getByText('BRAND')).toBeInTheDocument()
    expect(screen.getByText('form-here')).toBeInTheDocument()
  })
})
