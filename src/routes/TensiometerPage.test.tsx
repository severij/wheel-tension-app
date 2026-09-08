import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

const tensiometer: Tensiometer = { id: 't1', name: 'TM-1', curves: [] }

const initial: AppState = {
  wheels: [],
  tensiometers: [tensiometer],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderList(state: AppState = initial) {
  const router = createAppRouter({ initialEntries: ['/tensiometers'] })
  return render(
    <AppStoreProvider initial={state}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('TensiometerPage', () => {
  it('shows an empty state when no tensiometers exist', () => {
    renderList({ ...initial, tensiometers: [] })
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })

  it('adds a tensiometer and navigates straight into its edit view', async () => {
    const user = userEvent.setup()
    renderList({ ...initial, tensiometers: [] })
    await user.click(screen.getByRole('button', { name: '＋ Add tensiometer' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('New tensiometer')
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('navigates to the tensiometer detail when a row is clicked', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByText('TM-1'))
    expect(screen.getByRole('heading', { name: 'TM-1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '＋ Add curve' })).toBeInTheDocument()
  })

  it('deletes a tensiometer via the delete dialog', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Delete TM-1' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })

  it('does not create a tensiometer when the new edit is cancelled', async () => {
    const user = userEvent.setup()
    renderList({ ...initial, tensiometers: [] })
    await user.click(screen.getByRole('button', { name: '＋ Add tensiometer' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })
})
