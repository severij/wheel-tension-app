import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Settings, Tensiometer, Wheel, MeasurementSet } from '../types'
import { TensionRadar } from './TensionRadar'

// Chart.js renders to canvas, which jsdom does not rasterize, but the component
// and its React lifecycle should still run without throwing.
const tensiometers: Tensiometer[] = []
const settings: Settings = {
  displayUnit: 'kgf',
  defaultTolerancePct: 10,
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

function renderRadar(props: Partial<Parameters<typeof TensionRadar>[0]> = {}) {
  return render(
    <TensionRadar set={set} wheel={wheel} tensiometers={tensiometers} settings={settings} {...props} />,
  )
}

describe('TensionRadar', () => {
  it('renders the radar controls and toggle labels', () => {
    renderRadar()
    expect(screen.getByText('Tension radar')).toBeInTheDocument()
    expect(screen.getByLabelText('Left')).toBeInTheDocument()
    expect(screen.getByLabelText('Right')).toBeInTheDocument()
  })


  it('draws a single chart with both sides when both are shown', () => {
    renderRadar()
    expect(document.querySelectorAll('canvas')).toHaveLength(1)
  })
})
