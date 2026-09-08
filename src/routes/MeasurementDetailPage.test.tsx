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
  sets: [
    { id: 's1', date: new Date('2026-09-01').getTime(), mode: 'frequency', tensions: {} },
    { id: 's2', date: new Date('2026-09-08').getTime(), mode: 'direct', tensions: {} },
  ],
}

const initial: AppState = {
  wheels: [wheel],
  tensiometers: [],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderSet(setId: string) {
  const router = createAppRouter({ initialEntries: [`/wheel/w1/set/${setId}`] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('MeasurementDetailPage', () => {
  it('renders the measurement config, table, radar and stats read-only', () => {
    renderSet('s2')
    expect(screen.getByRole('heading', { name: 'Measurement' })).toBeInTheDocument()
    expect(screen.getByText('Measurement mode')).toBeInTheDocument()
    expect(screen.getByText('Tension radar')).toBeInTheDocument()
    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit measurement' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Measurement mode' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Spoke 1 left reading' })).toBeDisabled()
  })

  it('shows an edit icon on every measurement', () => {
    renderSet('s1')
    expect(screen.getByRole('button', { name: 'Edit measurement' })).toBeInTheDocument()
  })

  it('navigates to the edit page via the edit icon', async () => {
    const user = userEvent.setup()
    renderSet('s2')
    await user.click(screen.getByRole('button', { name: 'Edit measurement' }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Spoke 1 left reading' })).not.toBeDisabled()
  })

  it('switches measurements via the set selector', async () => {
    const user = userEvent.setup()
    renderSet('s2')
    await user.selectOptions(screen.getByLabelText('Current set'), '0')
    expect(screen.getByLabelText('Current set')).toHaveValue('0')
  })

  it('deletes the measurement via the delete dialog and returns to the wheel', async () => {
    const user = userEvent.setup()
    renderSet('s2')
    await user.click(screen.getByRole('button', { name: 'Delete measurement' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('heading', { name: 'Wheel setup' })).toBeInTheDocument()
  })
})
