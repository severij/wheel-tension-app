import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

const tensiometer: Tensiometer = {
  id: 't1',
  name: 'TM-1',
  curves: [
    {
      id: 'c1',
      gaugeMm: 1.8,
      calibratedOn: new Date('2026-09-08').getTime(),
      points: [
        { divisions: 0, kgf: 0 },
        { divisions: 5, kgf: 1 },
      ],
    },
  ],
}

const initial: AppState = {
  wheels: [],
  tensiometers: [tensiometer],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderDetail(state: AppState = initial) {
  const router = createAppRouter({ initialEntries: ['/tensiometers/t1'] })
  return render(
    <AppStoreProvider initial={state}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('TensiometerDetailPage', () => {
  it('lists the calibration curves of the tensiometer', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: 'TM-1' })).toBeInTheDocument()
    expect(screen.getByText('1.8 mm')).toBeInTheDocument()
    expect(screen.getByText(/2 points/)).toBeInTheDocument()
  })

  it('shows the name read-only and opens the edit page via the edit icon', async () => {
    const user = userEvent.setup()
    renderDetail()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit tensiometer' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('TM-1')
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'TM-2')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('heading', { name: 'TM-2' })).toBeInTheDocument()
  })

  it('navigates to the curve page when a curve is clicked', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByText('1.8 mm'))
    expect(screen.getByRole('heading', { name: 'Curve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit curve' })).toBeInTheDocument()
  })

  it('adds a curve and navigates straight into its editor', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: '＋ Add curve' }))
    expect(screen.getByRole('button', { name: 'Apply points' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /Gauge/ })).toBeInTheDocument()
  })

  it('deletes the tensiometer via the delete dialog and returns to the list', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Delete tensiometer' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('heading', { name: 'Tensiometers' })).toBeInTheDocument()
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })

  it('does not create a curve when the new curve edit is cancelled', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: '＋ Add curve' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Tensiometer' })).toBeInTheDocument()
    expect(screen.getAllByText('1.8 mm')).toHaveLength(1)
  })
})
