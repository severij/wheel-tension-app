import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

const initial: AppState = {
  wheels: [],
  tensiometers: [],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderSettings() {
  const router = createAppRouter({ initialEntries: ['/settings'] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('Settings', () => {
  it('shows settings read-only with an edit icon', () => {
    renderSettings()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit settings' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Display unit' })).not.toBeInTheDocument()
  })

  it('shows the flip tension distribution setting', () => {
    renderSettings()
    expect(screen.getByText('Flip tension distribution')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('edits settings and saves', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('button', { name: 'Edit settings' }))
    const unit = screen.getByRole('combobox', { name: 'Display unit' })
    await user.selectOptions(unit, 'N')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('N (newtons)')).toBeInTheDocument()
  })

  it('toggles and saves the flip setting', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.click(screen.getByRole('button', { name: 'Edit settings' }))
    await user.click(screen.getByRole('checkbox', { name: 'Flip tension distribution' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })
})
