import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Wheel } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

vi.mock('react-chartjs-2', () => ({
  Radar: () => <div data-testid="radar-stub" />,
}))

const wheel: Wheel = {
  id: 'w1',
  name: 'Road',
  leftCount: 2,
  rightCount: 2,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 280,
  freeLengthMmRight: 280,
  notes: '',
  sets: [{ id: 's1', date: new Date('2026-09-08').getTime(), mode: 'direct', tensions: {} }],
}

const initial: AppState = {
  wheels: [wheel],
  tensiometers: [],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderEdit() {
  const router = createAppRouter({ initialEntries: ['/wheel/w1/set/s1/edit'] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('MeasurementEditPage', () => {
  it('does not save the draft until Save is clicked', async () => {
    const user = userEvent.setup()
    renderEdit()
    const spoke = screen.getByRole('textbox', { name: 'Spoke 1 left reading' })
    await user.type(spoke, '300')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('textbox', { name: 'Spoke 1 left reading' })).toHaveValue('300')
    expect(screen.getByRole('textbox', { name: 'Spoke 1 left reading' })).toBeDisabled()
  })

  it('discards the draft when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderEdit()
    const spoke = screen.getByRole('textbox', { name: 'Spoke 1 left reading' })
    await user.type(spoke, '300')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('textbox', { name: 'Spoke 1 left reading' })).toHaveValue('')
  })

  it('changes the measurement date and saves it', async () => {
    const user = userEvent.setup()
    renderEdit()
    const date = screen.getByLabelText('Date & time')
    await user.clear(date)
    await user.type(date, '2026-09-10T10:30')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('heading', { name: 'Road' })).toBeInTheDocument()
    const viewDate = screen.getByLabelText('Date & time')
    expect(viewDate).toBeDisabled()
    expect(viewDate).toHaveValue('2026-09-10T10:30')
  })
})
