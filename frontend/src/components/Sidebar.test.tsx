import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconHome, Sidebar } from './Sidebar'

const base = {
  title: 'Admin',
  items: [{ key: 'home', label: 'Home', icon: <IconHome /> }],
  activeKey: 'home',
  switchLabel: 'Switch to user',
}

describe('Sidebar', () => {
  it('renders title/items and fires handlers', async () => {
    const onSelect = jest.fn()
    const onSwitch = jest.fn()
    const onLogout = jest.fn()

    render(
      <Sidebar
        {...base}
        onSelect={onSelect}
        onSwitch={onSwitch}
        onLogout={onLogout}
      />,
    )

    expect(screen.getByText('Admin')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Home'))
    expect(onSelect).toHaveBeenCalledWith('home')

    await userEvent.click(screen.getByText('Switch to user'))
    expect(onSwitch).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByText('Logout'))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
