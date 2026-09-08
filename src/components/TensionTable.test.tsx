import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Settings, Tensiometer, Wheel, MeasurementSet } from '../types'
import { TensionTable } from './TensionTable'

const settings: Settings = {
  displayUnit: 'kgf',
  defaultTolerancePct: 10,
  radarFlip: false,
  radarLeftColor: 'orange',
  radarRightColor: 'green',
}
const tensiometers: Tensiometer[] = []
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

function renderTable(s: MeasurementSet = set) {
  render(
    <TensionTable set={s} wheel={wheel} tensiometers={tensiometers} settings={settings} onChange={() => {}} />,
  )
}

describe('TensionTable', () => {
  it('renders the spoke tensions title', () => {
    renderTable()
    expect(screen.getByRole('heading', { name: 'Spoke tensions' })).toBeInTheDocument()
  })

  it('warns when a curve is missing in tensiometer mode', () => {
    renderTable({ ...set, mode: 'tensiometer' })
    expect(screen.getByText(/Select a calibration curve/)).toBeInTheDocument()
  })
})
