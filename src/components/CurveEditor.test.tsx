import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Tensiometer } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { CurveEditor } from './CurveEditor'

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
      points: [{ divisions: 0, kgf: 0 }],
    },
  ],
}

const initial: AppState = {
  wheels: [],
  tensiometers: [tensiometer],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderEditor(onSaved?: () => void) {
  return render(
    <AppStoreProvider initial={initial}>
      <CurveEditor tensiometerId="t1" curveId="c1" usedBy={0} onSaved={onSaved} />
    </AppStoreProvider>,
  )
}

describe('CurveEditor', () => {
  it('marks required fields as required', () => {
    renderEditor()
    expect(screen.getByRole('spinbutton', { name: 'Divisions' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'kgf' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: /Gauge/ })).toBeRequired()
  })

  it('lets the user empty and retype a calibration point value', async () => {
    const user = userEvent.setup()
    renderEditor()
    const divisions = screen.getByRole('spinbutton', { name: 'Divisions' })
    expect(divisions).toHaveValue(0)

    await user.clear(divisions)
    expect(divisions).toHaveValue(null)

    await user.type(divisions, '1')
    expect(divisions).toHaveValue(1)
  })

  it('keeps point values as entered when applying points', async () => {
    const user = userEvent.setup()
    renderEditor()
    const divisions = screen.getByRole('spinbutton', { name: 'Divisions' })
    await user.clear(divisions)
    await user.type(divisions, '12')
    await user.click(screen.getByRole('button', { name: 'Apply points' }))
    expect(divisions).toHaveValue(12)
  })

  it('calls onSaved after applying points', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    renderEditor(onSaved)
    await user.click(screen.getByRole('button', { name: 'Apply points' }))
    expect(onSaved).toHaveBeenCalledTimes(1)
  })
})
