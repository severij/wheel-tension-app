import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Settings, Tensiometer, Wheel, MeasurementSet } from '../types'
import { StatsPanel } from './StatsPanel'

const tensiometers: Tensiometer[] = []
const settings: Settings = {
  displayUnit: 'kgf',
  defaultTolerancePct: 10,
  radarFlip: false,
  radarLeftColor: 'orange',
  radarRightColor: 'green',
}
const wheel: Wheel = {
  id: 'w',
  name: 'W',
  leftCount: 2,
  rightCount: 2,
  gaugeMm: 2.0,
  densityKgM3: 7850,
  freeLengthMmLeft: 300,
  freeLengthMmRight: 280,
  sets: [],
}
const set: MeasurementSet = {
  id: 's',
  date: 0,
  mode: 'frequency',
  tensions: { 1: { left: 300, right: 320 }, 2: { left: 305, right: 315 } },
}

describe('StatsPanel', () => {
  it('renders per-side stats over entered spokes', () => {
    render(<StatsPanel set={set} wheel={wheel} tensiometers={tensiometers} settings={settings} />)
    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('Left (non-drive side)')).toBeInTheDocument()
    expect(screen.getByText('Right (drive side)')).toBeInTheDocument()
  })
})
