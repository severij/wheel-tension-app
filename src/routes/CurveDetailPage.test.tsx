import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

vi.mock('react-chartjs-2', () => ({
  Scatter: () => <div data-testid="scatter-stub" />,
}))

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

function renderCurve() {
  const router = createAppRouter({ initialEntries: ['/tensiometers/t1/c1'] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('CurveDetailPage', () => {
  it('shows the curve details read-only with edit and delete icons', () => {
    renderCurve()
    expect(screen.getByRole('heading', { name: 'Calibration curve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit curve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete curve' })).toBeInTheDocument()
    expect(screen.getByText('1.8')).toBeInTheDocument()
    expect(screen.getByText('Divisions')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Apply points' })).not.toBeInTheDocument()
  })

  it('opens the curve editor via the edit icon', async () => {
    const user = userEvent.setup()
    renderCurve()
    await user.click(screen.getByRole('button', { name: 'Edit curve' }))
    expect(screen.getByRole('button', { name: 'Apply points' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /Gauge/ })).toBeInTheDocument()
  })

  it('returns to the display view after applying edits', async () => {
    const user = userEvent.setup()
    renderCurve()
    await user.click(screen.getByRole('button', { name: 'Edit curve' }))
    const gauge = screen.getByRole('spinbutton', { name: /Gauge/ })
    await user.clear(gauge)
    await user.type(gauge, '2.0')
    await user.click(screen.getByRole('button', { name: 'Apply points' }))
    expect(screen.queryByRole('button', { name: 'Apply points' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calibration curve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit curve' })).toBeInTheDocument()
  })

  it('deletes the curve via the delete icon and returns to the tensiometer', async () => {
    const user = userEvent.setup()
    renderCurve()
    await user.click(screen.getByRole('button', { name: 'Delete curve' }))
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('heading', { name: 'Tensiometer' })).toBeInTheDocument()
    expect(screen.getByText('No calibration curves yet.')).toBeInTheDocument()
  })
})
