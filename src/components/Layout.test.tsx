import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider, emptyState } from '../state/AppStore'
import { createAppRouter } from '../router'

describe('Layout', () => {
  it('opens the menu from the hamburger button', async () => {
    const user = userEvent.setup()
    const router = createAppRouter({ initialEntries: ['/'] })
    render(
      <AppStoreProvider initial={emptyState()}>
        <RouterProvider router={router} />
      </AppStoreProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Wheel Library' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Wheels' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('link', { name: 'Wheels' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tensiometers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('link', { name: 'Wheels' })).not.toBeInTheDocument()
  })
})
