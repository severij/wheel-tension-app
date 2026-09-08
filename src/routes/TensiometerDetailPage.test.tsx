import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { TensiometerDetailPage } from './TensiometerDetailPage'
import { TensiometerPage } from './TensiometerPage'
import { CurveDetailPage } from './CurveDetailPage'

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
  return render(
    <AppStoreProvider initial={state}>
      <MemoryRouter initialEntries={['/tensiometers/t1']}>
        <Routes>
          <Route path="/tensiometers" element={<TensiometerPage />} />
          <Route path="/tensiometers/:tensiometerId" element={<TensiometerDetailPage />} />
          <Route path="/tensiometers/:tensiometerId/:curveId" element={<CurveDetailPage />} />
        </Routes>
      </MemoryRouter>
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

  it('lets the user edit the name', async () => {
    const user = userEvent.setup()
    renderDetail()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'TM-2')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('TM-2')
  })

  it('navigates to the curve page when a curve is clicked', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByText('1.8 mm'))
    expect(screen.getByRole('button', { name: 'Apply points' })).toBeInTheDocument()
  })

  it('adds a curve and navigates straight into its editor', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: '＋ Add curve' }))
    expect(screen.getByRole('button', { name: 'Apply points' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /Gauge/ })).toBeInTheDocument()
  })

  it('deletes the tensiometer and returns to the list', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(screen.getByRole('heading', { name: 'Tensiometers' })).toBeInTheDocument()
    expect(screen.getByText(/No tensiometers yet/)).toBeInTheDocument()
  })
})
