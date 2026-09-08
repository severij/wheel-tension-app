import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { TensiometerPage } from './TensiometerPage'
import { TensiometerDetailPage } from './TensiometerDetailPage'

const tensiometer: Tensiometer = {
  id: 't1',
  name: 'TM-1',
  curves: [],
}

const initial: AppState = {
  wheels: [],
  tensiometers: [tensiometer],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderList(state: AppState = initial) {
  return render(
    <AppStoreProvider initial={state}>
      <MemoryRouter initialEntries={['/tensiometers']}>
        <Routes>
          <Route path="/tensiometers" element={<TensiometerPage />} />
          <Route path="/tensiometers/:tensiometerId" element={<TensiometerDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AppStoreProvider>,
  )
}

describe('TensiometerPage', () => {
  it('shows an empty state when no tensiometers exist', () => {
    renderList({ ...initial, tensiometers: [] })
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })

  it('adds a tensiometer', async () => {
    const user = userEvent.setup()
    renderList({ ...initial, tensiometers: [] })
    await user.click(screen.getByRole('button', { name: '＋ Add tensiometer' }))
    expect(screen.getByText('New tensiometer')).toBeInTheDocument()
    expect(screen.getByText('0 calibration curves')).toBeInTheDocument()
  })

  it('navigates to the tensiometer detail when a row is clicked', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByText('TM-1'))
    expect(screen.getByRole('heading', { name: 'TM-1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '＋ Add curve' })).toBeInTheDocument()
  })

  it('deletes a tensiometer after confirmation', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })
})
