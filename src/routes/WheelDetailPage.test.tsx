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
  leftCount: 16,
  rightCount: 16,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 280,
  freeLengthMmRight: 280,
  notes: '',
  sets: [
    {
      id: 's1',
      date: new Date('2026-09-08').getTime(),
      mode: 'frequency',
      tensions: { 1: { left: 300 } },
    },
  ],
}

const initial: AppState = {
  wheels: [wheel],
  tensiometers: [],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderDetail(state: AppState = initial) {
  const router = createAppRouter({ initialEntries: ['/wheel/w1'] })
  return render(
    <AppStoreProvider initial={state}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('WheelDetailPage', () => {
  it('shows wheel details read-only with edit and delete icons', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: 'Wheel setup' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit wheel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete wheel' })).toBeInTheDocument()
  })

  it('opens the edit page via the edit icon', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Edit wheel' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Road')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('saves edits and returns to the display view', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Edit wheel' }))
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Gravel').length).toBeGreaterThan(0)
  })

  it('cancels the edit without saving', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Edit wheel' }))
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Road').length).toBeGreaterThan(0)
  })

  it('lists the measurements', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: 'Measurements' })).toBeInTheDocument()
    expect(screen.getByText(/Frequency/)).toBeInTheDocument()
  })

  it('navigates to the measurement page when a measurement is clicked', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByText(/Frequency/))
    expect(screen.getByText('Mode')).toBeInTheDocument()
  })

  it('adds a measurement and navigates straight into its edit view', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: '＋ New measurement' }))
    expect(screen.getByText('Mode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('deletes the wheel via the delete dialog and returns to the list', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Delete wheel' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('heading', { name: 'Wheel Library' })).toBeInTheDocument()
  })

  it('does not create a measurement when the new measurement edit is cancelled', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: '＋ New measurement' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Measurements' })).toBeInTheDocument()
    expect(screen.getAllByText(/Frequency/)).toHaveLength(1)
  })
})
