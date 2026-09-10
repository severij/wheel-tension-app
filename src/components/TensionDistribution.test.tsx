import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Settings, Tensiometer, Wheel, MeasurementSet } from '../types'
import { TensionDistribution } from './TensionDistribution'

// Chart.js renders to canvas, which jsdom does not rasterize, but the component
// and its React lifecycle should still run without throwing.
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

function renderDistribution(props: Partial<Parameters<typeof TensionDistribution>[0]> = {}) {
  return render(
    <TensionDistribution set={set} wheel={wheel} tensiometers={tensiometers} settings={settings} {...props} />,
  )
}

describe('TensionDistribution', () => {
  it('renders the distribution heading and flip toggle', () => {
    renderDistribution()
    expect(screen.getByText('Tension distribution')).toBeInTheDocument()
    expect(screen.getByLabelText('Flip')).toBeInTheDocument()
  })

  it('draws a single chart with both sides when both are shown', () => {
    renderDistribution()
    expect(document.querySelectorAll('canvas')).toHaveLength(1)
  })
})
